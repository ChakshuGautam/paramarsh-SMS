/**
 * CLI Interface for Seed Data Manager v3.0
 * Following TDD methodology - implementing to make tests pass
 */

import { ModularSeedOrchestrator } from '../core/ModularSeedOrchestrator';
import { AcademicYearSeeder } from '../entities/AcademicYearSeeder';
import { SubjectSeeder } from '../entities/SubjectSeeder';
import { ClassSeeder } from '../entities/ClassSeeder';
import { TenantSeeder } from '../entities/TenantSeeder';
import { TeacherSeeder } from '../entities/TeacherSeeder';
import { SeedOptions, OrchestrationResult, ValidationResult } from '../core/interfaces';
import * as fs from 'fs';
import * as path from 'path';

export interface CLIResult {
  success: boolean;
  command?: string;
  branchId?: string;
  branches?: string[];
  options?: Partial<SeedOptions>;
  seedResult?: OrchestrationResult;
  validationResult?: ValidationResult;
  multiResults?: OrchestrationResult[];
  error?: string;
}

export class SeedCLI {
  private orchestrator: ModularSeedOrchestrator;
  private readonly version = 'v3.0.0';

  constructor(customOrchestrator?: ModularSeedOrchestrator) {
    // Load configuration from environment
    const envConfig = this.loadEnvironmentConfig();
    
    this.orchestrator = customOrchestrator || new ModularSeedOrchestrator(envConfig);
    
    // Register default seeders if no custom orchestrator provided
    if (!customOrchestrator) {
      this.registerDefaultSeeders();
    }
  }

  /**
   * Get the orchestrator instance (for testing)
   */
  getOrchestrator(): ModularSeedOrchestrator {
    return this.orchestrator;
  }

  /**
   * Parse command line arguments and execute the command
   */
  async parseAndExecute(args: string[]): Promise<CLIResult> {
    try {
      // Handle empty arguments
      if (args.length === 0) {
        this.showHelp();
        return { success: false };
      }

      // Handle flags
      if (args[0] === '--help' || args[0] === '-h') {
        this.showHelp();
        return { success: true };
      }

      if (args[0] === '--version' || args[0] === '-v') {
        this.showVersion();
        return { success: true };
      }

      const command = args[0];
      
      switch (command) {
        case 'seed':
          return await this.handleSeedCommand(args.slice(1));
        
        case 'validate':
          return await this.handleValidateCommand(args.slice(1));
        
        case 'seed-multi':
          return await this.handleSeedMultiCommand(args.slice(1));
        
        case 'cleanup':
          return await this.handleCleanupCommand(args.slice(1));
        
        default:
          const error = `Unknown command: ${command}`;
          console.error(error);
          this.showHelp();
          return { success: false, error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('CLI Error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Handle seed command
   */
  private async handleSeedCommand(args: string[]): Promise<CLIResult> {
    const { branchId, options, flags } = this.parseArgs(args);

    // Handle interactive mode
    if (flags.interactive) {
      this.showAvailableBranches();
      return { success: true, command: 'seed' };
    }

    if (!branchId) {
      const error = 'Branch ID is required for seed command';
      console.error(error);
      return { success: false, error };
    }

    // Validate branch ID format
    if (!this.isValidBranchId(branchId)) {
      const error = `Invalid branch ID format: ${branchId}. Branch IDs can only contain letters, numbers, hyphens, and underscores.`;
      console.error(error);
      return { success: false, error };
    }

    try {
      console.log(`${options.dryRun ? '[DRY RUN] ' : ''}Starting seed operation for branch: ${branchId}`);
      
      const seedResult = await this.orchestrator.seedBranch(branchId, options);
      
      if (seedResult.success) {
        console.log('✅ Seed operation completed successfully');
        this.displaySeedResults(seedResult);
        
        if (flags.report) {
          this.saveReport(seedResult, flags.report);
        }
        
        if (flags.timing) {
          this.showTimingBreakdown(seedResult);
        }
      } else {
        console.error('❌ Seeding failed');
        seedResult.errors.forEach(error => {
          console.error(`  - ${error.message}`);
        });
      }

      return {
        success: seedResult.success,
        command: 'seed',
        branchId,
        options,
        seedResult,
        error: seedResult.success ? undefined : seedResult.errors.map(e => e.message).join(', ')
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Seeding failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Handle validate command
   */
  private async handleValidateCommand(args: string[]): Promise<CLIResult> {
    const { branchId } = this.parseArgs(args);

    if (!branchId) {
      const error = 'Branch ID is required for validate command';
      console.error(error);
      return { success: false, error };
    }

    // Validate branch ID format
    if (!this.isValidBranchId(branchId)) {
      const error = `Invalid branch ID format: ${branchId}. Branch IDs can only contain letters, numbers, hyphens, and underscores.`;
      console.error(error);
      return { success: false, error };
    }

    try {
      console.log(`Validating branch: ${branchId}`);
      
      const validationResult = await this.orchestrator.validateBranch(branchId);
      
      if (validationResult.success) {
        console.log('✅ Validation completed successfully');
        this.displayValidationResults(validationResult);
      } else {
        console.error('❌ Validation failed');
        console.error(`Try running: seed ${branchId}`);
      }

      return {
        success: validationResult.success,
        command: 'validate',
        branchId,
        validationResult
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Validation failed:', errorMessage);
      console.error(`Try running: seed ${branchId}`);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Handle seed-multi command
   */
  private async handleSeedMultiCommand(args: string[]): Promise<CLIResult> {
    const { branchId, options } = this.parseArgs(args);

    if (!branchId) {
      const error = 'Branch IDs are required for seed-multi command';
      console.error(error);
      return { success: false, error };
    }

    const branches = branchId.split(',').map(b => b.trim());

    try {
      console.log(`Starting multi-branch seeding for: ${branches.join(', ')}`);
      
      const multiResults = await this.orchestrator.seedMultipleBranches(branches, options);
      
      console.log('📊 Multi-branch seeding completed');
      this.displayMultiBranchResults(multiResults);

      const allSuccessful = multiResults.every(r => r.success);

      return {
        success: allSuccessful,
        command: 'seed-multi',
        branches,
        options,
        multiResults
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Multi-branch seeding failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Handle cleanup command
   */
  private async handleCleanupCommand(args: string[]): Promise<CLIResult> {
    const { branchId, flags } = this.parseArgs(args);

    if (!branchId) {
      const error = 'Branch ID is required for cleanup command';
      console.error(error);
      return { success: false, error };
    }

    // Validate branch ID format
    if (!this.isValidBranchId(branchId)) {
      const error = `Invalid branch ID format: ${branchId}. Branch IDs can only contain letters, numbers, hyphens, and underscores.`;
      console.error(error);
      return { success: false, error };
    }

    try {
      if (flags.confirm) {
        console.log(`⚠️  This will cleanup resources for branch: ${branchId}`);
      }

      await this.orchestrator.cleanup(branchId);
      console.log('✅ Cleanup completed successfully');

      return {
        success: true,
        command: 'cleanup',
        branchId
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Cleanup failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Parse command line arguments
   */
  private parseArgs(args: string[]): {
    branchId?: string;
    options: Partial<SeedOptions>;
    flags: Record<string, any>;
  } {
    const options: Partial<SeedOptions> = {};
    const flags: Record<string, any> = {};
    let branchId: string | undefined;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg.startsWith('--')) {
        const flag = arg.slice(2);
        
        switch (flag) {
          case 'verbose':
            options.verbose = true;
            break;
          case 'dry-run':
            options.dryRun = true;
            break;
          case 'skip-validation':
            options.skipValidation = true;
            break;
          case 'batch-size':
            options.batchSize = parseInt(args[++i], 10);
            break;
          case 'max-retries':
            options.maxRetries = parseInt(args[++i], 10);
            break;
          case 'parallel':
            options.parallel = true;
            break;
          case 'interactive':
            flags.interactive = true;
            break;
          case 'confirm':
            flags.confirm = true;
            break;
          case 'report':
            flags.report = args[++i] || './seed-report.json';
            break;
          case 'timing':
            flags.timing = true;
            break;
          case 'config':
            flags.config = args[++i];
            break;
        }
      } else if (!branchId) {
        branchId = arg;
      }
    }

    return { branchId, options, flags };
  }

  /**
   * Display seed results
   */
  private displaySeedResults(result: OrchestrationResult): void {
    console.log(`📊 Total records seeded: ${result.totalSeeded}`);
    console.log(`⏱️  Duration: ${result.metrics.duration}ms`);
    
    if (result.metrics.memoryUsage) {
      const heapMB = Math.round(result.metrics.memoryUsage.heapUsed / 1024 / 1024);
      console.log(`💾 Memory used: ${heapMB}MB`);
    }

    // Show entity-specific results
    for (const [entityName, entityResult] of Object.entries(result.entityResults)) {
      const icon = entityResult.success ? '✅' : '❌';
      console.log(`   ${icon} ${entityName}: ${entityResult.metrics.totalRecords} records`);
    }
  }

  /**
   * Display validation results
   */
  private displayValidationResults(result: ValidationResult): void {
    console.log('🔍 Validation Results:');
    
    for (const [entityName, isValid] of Object.entries(result.entityValidations)) {
      const icon = isValid ? '✅' : '❌';
      console.log(`   ${icon} ${entityName}: ${isValid ? 'Valid' : 'Invalid'}`);
    }

    if (result.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      result.warnings.forEach(warning => {
        console.log(`   - ${warning}`);
      });
    }
  }

  /**
   * Display multi-branch results
   */
  private displayMultiBranchResults(results: OrchestrationResult[]): void {
    console.log('📋 Multi-branch Summary:');
    
    results.forEach(result => {
      const icon = result.success ? '✅' : '❌';
      console.log(`   ${result.branchId}: ${icon} (${result.totalSeeded} records)`);
    });

    const totalRecords = results.reduce((sum, r) => sum + r.totalSeeded, 0);
    const successCount = results.filter(r => r.success).length;
    
    console.log(`\n📊 Overall: ${successCount}/${results.length} branches successful, ${totalRecords} total records`);
  }

  /**
   * Show available branches for interactive mode
   */
  private showAvailableBranches(): void {
    console.log('🏫 Available branches:');
    console.log('   - dps-main (Delhi Public School - Main Campus)');
    console.log('   - kvs-central (Kendriya Vidyalaya - Central)');
    console.log('   - aps-north (Army Public School - North)');
    console.log('   - etc...');
  }

  /**
   * Save execution report
   */
  private saveReport(result: OrchestrationResult, filePath: string): void {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        version: this.version,
        result
      };
      
      fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
      console.log(`📄 Report saved to: ${filePath}`);
    } catch (error) {
      console.warn(`Failed to save report: ${error}`);
    }
  }

  /**
   * Show timing breakdown
   */
  private showTimingBreakdown(result: OrchestrationResult): void {
    console.log('\n⏱️  Timing breakdown:');
    console.log(`   Total duration: ${result.metrics.duration}ms`);
    
    for (const [entityName, entityResult] of Object.entries(result.entityResults)) {
      console.log(`   ${entityName}: ${entityResult.metrics.duration}ms`);
    }
  }

  /**
   * Load configuration from environment variables
   */
  private loadEnvironmentConfig(): Partial<SeedOptions> {
    const config: Partial<SeedOptions> = {};

    if (process.env.SEED_BATCH_SIZE) {
      config.batchSize = parseInt(process.env.SEED_BATCH_SIZE, 10);
    }

    if (process.env.SEED_VERBOSE) {
      config.verbose = process.env.SEED_VERBOSE === 'true';
    }

    if (process.env.SEED_MAX_RETRIES) {
      config.maxRetries = parseInt(process.env.SEED_MAX_RETRIES, 10);
    }

    return config;
  }

  /**
   * Register default seeders
   */
  private registerDefaultSeeders(): void {
    // Foundation entity - no dependencies
    const tenantSeeder = new TenantSeeder();
    this.orchestrator.registerSeeder(tenantSeeder);
    
    // Academic structure entities
    const academicYearSeeder = new AcademicYearSeeder();
    this.orchestrator.registerSeeder(academicYearSeeder);
    
    const subjectSeeder = new SubjectSeeder();
    this.orchestrator.registerSeeder(subjectSeeder);
    
    const classSeeder = new ClassSeeder();
    this.orchestrator.registerSeeder(classSeeder);
    
    // Personnel entities
    const teacherSeeder = new TeacherSeeder();
    this.orchestrator.registerSeeder(teacherSeeder);
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.log(`
🌱 Seed Data Manager ${this.version}
Modern, modular seed data management for School Management System

Usage:
  seed-cli <command> [options]

Commands:
  seed <branchId>           Seed data for a specific branch
  validate <branchId>       Validate seeded data for a branch
  seed-multi <branchIds>    Seed multiple branches (comma-separated)
  cleanup <branchId>        Cleanup resources for a branch

Options:
  --verbose                 Show detailed progress information
  --batch-size <number>     Set batch size for processing (default: 100)
  --dry-run                 Simulate seeding without database changes
  --skip-validation         Continue on validation errors
  --max-retries <number>    Maximum retry attempts (default: 1)
  --parallel                Enable parallel processing
  --interactive             Interactive branch selection
  --confirm                 Skip confirmation prompts
  --report <file>           Save execution report to file
  --timing                  Show detailed timing information
  --config <file>           Load configuration from file

Examples:
  seed-cli seed dps-main --verbose
  seed-cli seed-multi dps-main,kvs-central --batch-size 200
  seed-cli validate dps-main
  seed-cli seed dps-main --dry-run --report ./report.json
  seed-cli cleanup dps-main --confirm

Global Options:
  --help, -h               Show this help message
  --version, -v            Show version information
`);
  }

  /**
   * Show version information
   */
  private showVersion(): void {
    console.log(`Seed Data Manager ${this.version}`);
  }

  /**
   * Validate branch ID format
   */
  private isValidBranchId(branchId: string): boolean {
    // Branch IDs should contain only letters, numbers, hyphens, and underscores
    // Must start with a letter or number
    const branchIdPattern = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;
    return branchIdPattern.test(branchId) && branchId.length >= 2 && branchId.length <= 50;
  }
}