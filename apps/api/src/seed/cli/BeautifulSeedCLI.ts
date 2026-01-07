/**
 * Beautiful CLI Interface for Seed Data Manager v3.0
 * Using Clack for stunning terminal UI
 */

import * as p from '@clack/prompts';
import { setTimeout } from 'node:timers/promises';
import color from 'picocolors';
import { ModularSeedOrchestrator } from '../core/ModularSeedOrchestrator';
import { AcademicYearSeeder } from '../entities/AcademicYearSeeder';
import { SubjectSeeder } from '../entities/SubjectSeeder';
import { ClassSeeder } from '../entities/ClassSeeder';
import { TenantSeeder } from '../entities/TenantSeeder';
import { TeacherSeeder } from '../entities/TeacherSeeder';
import { SeedOptions, OrchestrationResult, ValidationResult } from '../core/interfaces';
import * as fs from 'fs';

// Branch configurations with emojis
const BRANCHES = {
  'dps-main': { name: '🏫 Delhi Public School - Main Campus', type: 'CBSE' },
  'dps-north': { name: '🏫 Delhi Public School - North Campus', type: 'CBSE' },
  'dps-south': { name: '🏫 Delhi Public School - South Campus', type: 'CBSE' },
  'kvs-central': { name: '🎓 Kendriya Vidyalaya - Central', type: 'CBSE' },
  'kvs-east': { name: '🎓 Kendriya Vidyalaya - East', type: 'CBSE' },
  'aps-north': { name: '⭐ Army Public School - North', type: 'CBSE' },
  'aps-south': { name: '⭐ Army Public School - South', type: 'CBSE' },
  'sps-main': { name: '✨ St. Paul\'s School - Main Wing', type: 'ICSE' },
  'ris-main': { name: '🌟 Ryan International School - Main Branch', type: 'CBSE' },
  'dav-main': { name: '🔆 DAV Public School - Main', type: 'CBSE' },
  'test-branch': { name: '🧪 Test Branch (for testing)', type: 'TEST' }
};

interface CLIArgs {
  command?: string;
  branch?: string;
  branches?: string[];
  options: {
    verbose?: boolean;
    dryRun?: boolean;
    parallel?: boolean;
    batchSize?: number;
    help?: boolean;
    version?: boolean;
    interactive?: boolean;
  };
}

export class BeautifulSeedCLI {
  private orchestrator: ModularSeedOrchestrator;
  private readonly version = 'v3.0.0';

  constructor() {
    const envConfig = this.loadEnvironmentConfig();
    this.orchestrator = new ModularSeedOrchestrator(envConfig);
    this.registerSeeders();
  }

  /**
   * Parse command line arguments
   */
  private parseArgs(args: string[]): CLIArgs {
    const result: CLIArgs = {
      options: {}
    };

    let i = 0;
    while (i < args.length) {
      const arg = args[i];

      if (arg === '--help' || arg === '-h') {
        result.options.help = true;
      } else if (arg === '--version' || arg === '-v') {
        result.options.version = true;
      } else if (arg === '--interactive' || arg === '-i') {
        result.options.interactive = true;
      } else if (arg === '--verbose') {
        result.options.verbose = true;
      } else if (arg === '--dry-run') {
        result.options.dryRun = true;
      } else if (arg === '--parallel') {
        result.options.parallel = true;
      } else if (arg === '--batch-size') {
        result.options.batchSize = parseInt(args[++i], 10);
      } else if (!arg.startsWith('--')) {
        if (!result.command) {
          result.command = arg;
        } else if (result.command === 'seed-multi') {
          result.branches = (args[i] || '').split(',');
        } else {
          result.branch = arg;
        }
      }
      i++;
    }

    return result;
  }

  /**
   * Main entry point - handles both CLI and interactive modes
   */
  async run(argv?: string[]): Promise<void> {
    const args = this.parseArgs(argv || process.argv.slice(2));

    // Handle help
    if (args.options.help) {
      this.showHelp();
      return;
    }

    // Handle version
    if (args.options.version) {
      console.log(color.cyan(`Paramarsh SMS Seed Manager ${this.version}`));
      return;
    }

    // Force interactive mode if requested or no command provided
    if (args.options.interactive || !args.command) {
      await this.runInteractive();
      return;
    }

    // Execute command directly
    await this.runCommand(args);
  }

  /**
   * Run command directly from CLI arguments
   */
  private async runCommand(args: CLIArgs): Promise<void> {
    console.clear();
    p.intro(color.bgCyan(color.black(' 🌱 Paramarsh SMS - Seed Data Manager v3.0 ')));

    switch (args.command) {
      case 'seed':
        if (!args.branch) {
          p.log.error('Branch name is required for seed command');
          p.log.info('Usage: seed <branch> [--dry-run] [--verbose] [--batch-size <n>]');
          p.log.info('Example: seed dps-main --verbose');
          p.outro(color.red('Operation failed'));
          process.exit(1);
        }
        await this.executeSeed(args.branch, args.options);
        break;

      case 'seed-multi':
        if (!args.branches || args.branches.length === 0) {
          p.log.error('Branch names are required for seed-multi command');
          p.log.info('Usage: seed-multi <branch1,branch2,...> [--parallel] [--verbose]');
          p.log.info('Example: seed-multi dps-main,kvs-central --parallel');
          p.outro(color.red('Operation failed'));
          process.exit(1);
        }
        await this.executeMultiSeed(args.branches, args.options);
        break;

      case 'validate':
        if (!args.branch) {
          p.log.error('Branch name is required for validate command');
          p.log.info('Usage: validate <branch>');
          p.log.info('Example: validate dps-main');
          p.outro(color.red('Operation failed'));
          process.exit(1);
        }
        await this.executeValidate(args.branch);
        break;

      case 'cleanup':
        if (!args.branch) {
          p.log.error('Branch name is required for cleanup command');
          p.log.info('Usage: cleanup <branch>');
          p.log.info('Example: cleanup dps-main');
          p.outro(color.red('Operation failed'));
          process.exit(1);
        }
        await this.executeCleanup(args.branch);
        break;

      case 'status':
        await this.executeStatus();
        break;

      default:
        p.log.error(`Unknown command: ${args.command}`);
        p.log.info('Available commands: seed, seed-multi, validate, cleanup, status');
        p.outro(color.red('Operation failed'));
        process.exit(1);
    }
  }

  /**
   * Execute seed command
   */
  private async executeSeed(branch: string, options: CLIArgs['options']): Promise<void> {
    const branchInfo = BRANCHES[branch as keyof typeof BRANCHES];
    if (!branchInfo) {
      p.log.warn(`Unknown branch: ${branch}. Using default configuration.`);
    }

    const seedOptions: Partial<SeedOptions> = {
      dryRun: options.dryRun || false,
      verbose: options.verbose || false,
      batchSize: options.batchSize || 100
    };

    const s = p.spinner();
    s.start(`${seedOptions.dryRun ? '[DRY RUN] ' : ''}Seeding ${branchInfo?.name || branch}`);

    try {
      const result = await this.orchestrator.seedBranch(branch, seedOptions);
      
      if (result.success) {
        s.stop('✅ Seeding completed successfully!');
        
        const note = this.formatResults(result);
        p.note(note, '📊 Seeding Results');
        
        p.outro(color.green('✨ Seeding completed successfully! ✨'));
        process.exit(0);
      } else {
        s.stop('❌ Seeding failed');
        p.log.error('Errors encountered:');
        result.errors.forEach(err => {
          p.log.error(`  • ${err.message}`);
        });
        p.outro(color.red('Operation failed'));
        process.exit(1);
      }
    } catch (error) {
      s.stop('❌ Seeding failed with error');
      p.log.error(error instanceof Error ? error.message : String(error));
      p.outro(color.red('Operation failed'));
      process.exit(1);
    }
  }

  /**
   * Execute multi-seed command
   */
  private async executeMultiSeed(branches: string[], options: CLIArgs['options']): Promise<void> {
    const seedOptions: Partial<SeedOptions> = {
      parallel: options.parallel || false,
      verbose: options.verbose || false
    };

    const s = p.spinner();
    s.start(`Seeding ${branches.length} branches...`);

    try {
      const results = await this.orchestrator.seedMultipleBranches(branches, seedOptions);
      s.stop('✅ Multi-branch seeding completed!');

      const summary = this.formatMultiResults(results, branches);
      p.note(summary, '📊 Multi-Branch Seeding Summary');

      const allSuccess = results.every(r => r.success);
      if (allSuccess) {
        p.outro(color.green('✨ All branches seeded successfully! ✨'));
        process.exit(0);
      } else {
        p.outro(color.yellow('⚠️ Some branches had issues'));
        process.exit(1);
      }
    } catch (error) {
      s.stop('❌ Multi-seed failed');
      p.log.error(error instanceof Error ? error.message : String(error));
      p.outro(color.red('Operation failed'));
      process.exit(1);
    }
  }

  /**
   * Execute validate command
   */
  private async executeValidate(branch: string): Promise<void> {
    const branchInfo = BRANCHES[branch as keyof typeof BRANCHES];
    
    const s = p.spinner();
    s.start(`Validating ${branchInfo?.name || branch}`);

    try {
      const result = await this.orchestrator.validateBranch(branch);
      
      if (result.success) {
        s.stop('✅ Validation passed!');
        
        const validationNote = this.formatValidation(result);
        p.note(validationNote, '✅ Validation Results');
        
        p.outro(color.green('✨ Validation successful! ✨'));
        process.exit(0);
      } else {
        s.stop('❌ Validation failed');
        
        const issues = this.formatValidationIssues(result);
        p.note(issues, '⚠️ Validation Issues');
        
        p.log.info(`Run: seed ${branch} to fix the issues`);
        p.outro(color.yellow('Validation failed'));
        process.exit(1);
      }
    } catch (error) {
      s.stop('❌ Validation error');
      p.log.error(error instanceof Error ? error.message : String(error));
      p.outro(color.red('Operation failed'));
      process.exit(1);
    }
  }

  /**
   * Execute cleanup command
   */
  private async executeCleanup(branch: string): Promise<void> {
    const branchInfo = BRANCHES[branch as keyof typeof BRANCHES];
    
    p.log.warn(`⚠️  This will remove ALL seeded data for ${branchInfo?.name || branch}`);
    
    const s = p.spinner();
    s.start(`Cleaning up ${branchInfo?.name || branch}`);

    try {
      await this.orchestrator.cleanup(branch);
      s.stop('✅ Cleanup completed successfully!');
      p.log.success(`All seeded data for ${branch} has been removed.`);
      p.outro(color.green('✨ Cleanup successful! ✨'));
      process.exit(0);
    } catch (error) {
      s.stop('❌ Cleanup failed');
      p.log.error(error instanceof Error ? error.message : String(error));
      p.outro(color.red('Operation failed'));
      process.exit(1);
    }
  }

  /**
   * Execute status command
   */
  private async executeStatus(): Promise<void> {
    const s = p.spinner();
    s.start('Gathering statistics...');

    try {
      await setTimeout(500); // Simulate gathering stats
      
      const stats = await this.gatherStatistics();
      s.stop('📊 Current System Status');
      
      p.note(stats, '📈 Seed Data Statistics');
      p.outro(color.cyan('✨ Status check complete! ✨'));
      process.exit(0);
    } catch (error) {
      s.stop('❌ Failed to gather statistics');
      p.log.error(error instanceof Error ? error.message : String(error));
      p.outro(color.red('Operation failed'));
      process.exit(1);
    }
  }

  /**
   * Run interactive mode
   */
  private async runInteractive(): Promise<void> {
    console.clear();
    
    p.intro(color.bgCyan(color.black(' 🌱 Paramarsh SMS - Seed Data Manager v3.0 ')));

    const action = await p.select({
      message: 'What would you like to do?',
      options: [
        { value: 'seed', label: '🌱 Seed Data - Create test data for a branch' },
        { value: 'seed-multi', label: '🌳 Multi-Seed - Seed multiple branches at once' },
        { value: 'validate', label: '✅ Validate - Check existing data integrity' },
        { value: 'cleanup', label: '🧹 Cleanup - Remove seeded data' },
        { value: 'status', label: '📊 Status - View seeding statistics' },
        { value: 'exit', label: '👋 Exit' }
      ],
    });

    if (p.isCancel(action)) {
      p.cancel('Operation cancelled');
      process.exit(0);
    }

    switch (action) {
      case 'seed':
        await this.handleSeed();
        break;
      case 'seed-multi':
        await this.handleMultiSeed();
        break;
      case 'validate':
        await this.handleValidate();
        break;
      case 'cleanup':
        await this.handleCleanup();
        break;
      case 'status':
        await this.handleStatus();
        break;
      case 'exit':
        p.outro(color.cyan('Thanks for using Paramarsh SMS Seed Manager! 👋'));
        process.exit(0);
    }
  }

  /**
   * Handle single branch seeding interactively
   */
  private async handleSeed(): Promise<void> {
    const branch = await p.select({
      message: 'Select a branch to seed:',
      options: Object.entries(BRANCHES).map(([id, info]) => ({
        value: id,
        label: `${info.name} (${info.type})`,
        hint: id
      }))
    });

    if (p.isCancel(branch)) {
      p.cancel('Seeding cancelled');
      return;
    }

    const options = await p.group({
      dryRun: () => p.confirm({
        message: 'Run in dry-run mode? (simulate without database changes)',
        initialValue: false
      }),
      verbose: () => p.confirm({
        message: 'Enable verbose output?',
        initialValue: false
      }),
      batchSize: () => p.text({
        message: 'Batch size for processing:',
        placeholder: '100',
        initialValue: '100',
        validate: (value) => {
          const num = parseInt(value);
          if (isNaN(num) || num < 1) return 'Batch size must be a positive number';
        }
      })
    });

    if (p.isCancel(options)) {
      p.cancel('Seeding cancelled');
      return;
    }

    await this.executeSeed(branch as string, {
      dryRun: options.dryRun as boolean,
      verbose: options.verbose as boolean,
      batchSize: parseInt(options.batchSize as string)
    });
  }

  /**
   * Handle multi-branch seeding interactively
   */
  private async handleMultiSeed(): Promise<void> {
    const branches = await p.multiselect({
      message: 'Select branches to seed (use space to select, enter to confirm):',
      options: Object.entries(BRANCHES).map(([id, info]) => ({
        value: id,
        label: `${info.name}`,
        hint: `${info.type} - ${id}`
      })),
      required: true
    });

    if (p.isCancel(branches)) {
      p.cancel('Multi-seed cancelled');
      return;
    }

    const options = await p.group({
      parallel: () => p.confirm({
        message: 'Run in parallel? (faster but uses more resources)',
        initialValue: false
      }),
      verbose: () => p.confirm({
        message: 'Enable verbose output?',
        initialValue: false
      })
    });

    if (p.isCancel(options)) {
      p.cancel('Multi-seed cancelled');
      return;
    }

    await this.executeMultiSeed(branches as string[], {
      parallel: options.parallel as boolean,
      verbose: options.verbose as boolean
    });
  }

  /**
   * Handle validation interactively
   */
  private async handleValidate(): Promise<void> {
    const branch = await p.select({
      message: 'Select a branch to validate:',
      options: Object.entries(BRANCHES).map(([id, info]) => ({
        value: id,
        label: `${info.name} (${info.type})`,
        hint: id
      }))
    });

    if (p.isCancel(branch)) {
      p.cancel('Validation cancelled');
      return;
    }

    await this.executeValidate(branch as string);
  }

  /**
   * Handle cleanup interactively
   */
  private async handleCleanup(): Promise<void> {
    const branch = await p.select({
      message: 'Select a branch to cleanup:',
      options: Object.entries(BRANCHES).map(([id, info]) => ({
        value: id,
        label: `${info.name} (${info.type})`,
        hint: id
      }))
    });

    if (p.isCancel(branch)) {
      p.cancel('Cleanup cancelled');
      return;
    }

    const confirm = await p.confirm({
      message: 'Are you absolutely sure? This action cannot be undone!',
      initialValue: false
    });

    if (p.isCancel(confirm) || !confirm) {
      p.cancel('Cleanup cancelled');
      return;
    }

    await this.executeCleanup(branch as string);
  }

  /**
   * Handle status display interactively
   */
  private async handleStatus(): Promise<void> {
    await this.executeStatus();
  }

  /**
   * Show help message
   */
  private showHelp(): void {
    console.log(color.cyan(`
🌱 Paramarsh SMS - Seed Data Manager ${this.version}

${color.bold('Usage:')}
  seed-cli <command> [options]

${color.bold('Commands:')}
  seed <branch>           Seed data for a specific branch
  seed-multi <branches>   Seed multiple branches (comma-separated)
  validate <branch>       Validate seeded data for a branch
  cleanup <branch>        Cleanup resources for a branch
  status                  View seeding statistics

${color.bold('Options:')}
  --verbose              Show detailed progress information
  --dry-run              Simulate seeding without database changes
  --parallel             Enable parallel processing (multi-seed only)
  --batch-size <n>       Set batch size for processing (default: 100)
  --interactive, -i      Force interactive mode
  --help, -h             Show this help message
  --version, -v          Show version information

${color.bold('Examples:')}
  seed-cli seed dps-main --verbose
  seed-cli seed-multi dps-main,kvs-central --parallel
  seed-cli validate dps-main
  seed-cli cleanup test-branch
  seed-cli --interactive    # Run in interactive mode

${color.bold('Available Branches:')}
${Object.entries(BRANCHES).map(([id, info]) => `  ${id.padEnd(15)} ${info.name}`).join('\n')}
`));
  }

  /**
   * Format seeding results for display
   */
  private formatResults(result: OrchestrationResult): string {
    const lines = [
      `Branch: ${color.cyan(result.branchId || 'N/A')}`,
      `Total Records: ${color.green(result.totalSeeded.toString())}`,
      `Duration: ${color.yellow(result.metrics.duration + 'ms')}`,
      '',
      'Entity Breakdown:'
    ];

    for (const [entity, entityResult] of Object.entries(result.entityResults)) {
      const icon = entityResult.success ? '✅' : '❌';
      const count = entityResult.metrics.totalRecords;
      lines.push(`  ${icon} ${entity}: ${color.blue(count.toString())} records`);
    }

    if (result.metrics.memoryUsage) {
      const mb = Math.round(result.metrics.memoryUsage.heapUsed / 1024 / 1024);
      lines.push('');
      lines.push(`Memory Usage: ${color.magenta(mb + 'MB')}`);
    }

    return lines.join('\n');
  }

  /**
   * Format multi-branch results
   */
  private formatMultiResults(results: OrchestrationResult[], branches: string[]): string {
    const lines = [''];
    let totalRecords = 0;
    let successCount = 0;

    results.forEach((result, index) => {
      const branch = branches[index];
      const icon = result.success ? '✅' : '❌';
      totalRecords += result.totalSeeded;
      if (result.success) successCount++;
      
      lines.push(`${icon} ${BRANCHES[branch as keyof typeof BRANCHES]?.name || branch}`);
      lines.push(`   Records: ${color.blue(result.totalSeeded.toString())} | Duration: ${color.yellow(result.metrics.duration + 'ms')}`);
      lines.push('');
    });

    lines.push('─'.repeat(40));
    lines.push(`Total: ${color.green(successCount + '/' + branches.length)} branches successful`);
    lines.push(`Records Created: ${color.cyan(totalRecords.toString())}`);

    return lines.join('\n');
  }

  /**
   * Format validation results
   */
  private formatValidation(result: ValidationResult): string {
    const lines = [''];
    
    for (const [entity, isValid] of Object.entries(result.entityValidations)) {
      const icon = isValid ? '✅' : '❌';
      const status = isValid ? color.green('Valid') : color.red('Invalid');
      lines.push(`${icon} ${entity}: ${status}`);
    }

    if (result.warnings.length > 0) {
      lines.push('');
      lines.push('⚠️  Warnings:');
      result.warnings.forEach(warning => {
        lines.push(`  • ${color.yellow(warning)}`);
      });
    }

    return lines.join('\n');
  }

  /**
   * Format validation issues
   */
  private formatValidationIssues(result: ValidationResult): string {
    const lines = [''];
    const invalidEntities = Object.entries(result.entityValidations)
      .filter(([_, isValid]) => !isValid)
      .map(([entity, _]) => entity);

    lines.push('The following entities have issues:');
    lines.push('');
    
    invalidEntities.forEach(entity => {
      lines.push(`  ❌ ${entity} - Missing or invalid data`);
    });

    if (result.warnings.length > 0) {
      lines.push('');
      lines.push('Additional warnings:');
      result.warnings.forEach(warning => {
        lines.push(`  ⚠️  ${warning}`);
      });
    }

    return lines.join('\n');
  }

  /**
   * Gather system statistics
   */
  private async gatherStatistics(): Promise<string> {
    const lines = [
      'System Overview:',
      '',
      `Total Branches: ${color.cyan(Object.keys(BRANCHES).length.toString())}`,
      `Available Seeders: ${color.green('7')}`,
      '  • Tenants',
      '  • Academic Years',
      '  • Subjects',
      '  • Classes',
      '  • Teachers',
      '  • Students (pending)',
      '  • Guardians (pending)',
      '',
      'Seed Configuration:',
      `  Default Batch Size: ${color.yellow('100')}`,
      `  Max Retries: ${color.yellow('3')}`,
      `  Version: ${color.magenta(this.version)}`,
      '',
      'Branch Types:',
      `  CBSE Schools: ${color.blue('9')}`,
      `  ICSE Schools: ${color.blue('1')}`,
      `  Test Branches: ${color.gray('1')}`
    ];

    return lines.join('\n');
  }

  /**
   * Register seeders
   */
  private registerSeeders(): void {
    const tenantSeeder = new TenantSeeder();
    this.orchestrator.registerSeeder(tenantSeeder);
    
    const academicYearSeeder = new AcademicYearSeeder();
    this.orchestrator.registerSeeder(academicYearSeeder);
    
    const subjectSeeder = new SubjectSeeder();
    this.orchestrator.registerSeeder(subjectSeeder);
    
    const classSeeder = new ClassSeeder();
    this.orchestrator.registerSeeder(classSeeder);
    
    const teacherSeeder = new TeacherSeeder();
    this.orchestrator.registerSeeder(teacherSeeder);
  }

  /**
   * Load environment configuration
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
}

// Export for direct CLI usage
export async function runCLI(argv?: string[]) {
  const cli = new BeautifulSeedCLI();
  await cli.run(argv);
}