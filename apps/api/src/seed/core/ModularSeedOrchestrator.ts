/**
 * Modular Seed Orchestrator - Main coordination engine for v3.0
 * Following TDD methodology and V3-IMPLEMENTATION-SPEC.md
 */

import { PrismaClient } from '@prisma/client';
import { 
  ISeedEntity, 
  SeedContext, 
  SeedOptions, 
  SeederRegistry, 
  OrchestrationResult, 
  ValidationResult,
  SeedMetrics,
  SeedResult
} from './interfaces';
import { SeedLogger, LogLevel } from './SeedLogger';

export class ModularSeedOrchestrator {
  private seeders: SeederRegistry = {};
  private defaultOptions: Partial<SeedOptions>;

  constructor(defaultOptions: Partial<SeedOptions> = {}) {
    this.defaultOptions = {
      batchSize: 100,
      skipValidation: false,
      dryRun: false,
      verbose: false,
      parallel: false,
      maxRetries: 1,
      ...defaultOptions
    };
  }

  /**
   * Register a single seeder
   */
  registerSeeder(seeder: ISeedEntity, options: { override?: boolean } = {}): void {
    if (this.seeders[seeder.entityName] && !options.override) {
      throw new Error(`Seeder for entity ${seeder.entityName} is already registered`);
    }
    
    this.seeders[seeder.entityName] = seeder;
  }

  /**
   * Register multiple seeders
   */
  registerSeeders(seeders: ISeedEntity[]): void {
    for (const seeder of seeders) {
      this.registerSeeder(seeder);
    }
  }

  /**
   * Get all registered seeders
   */
  getRegisteredSeeders(): ISeedEntity[] {
    return Object.values(this.seeders);
  }

  /**
   * Get execution order based on dependencies (topological sort)
   */
  getExecutionOrder(): ISeedEntity[] {
    const seeders = Object.values(this.seeders);
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: ISeedEntity[] = [];

    const visit = (seeder: ISeedEntity) => {
      if (visiting.has(seeder.entityName)) {
        throw new Error(`Circular dependency detected involving ${seeder.entityName}`);
      }
      
      if (visited.has(seeder.entityName)) {
        return;
      }

      visiting.add(seeder.entityName);

      // Visit dependencies first
      for (const depName of seeder.dependencies) {
        const depSeeder = this.seeders[depName];
        if (!depSeeder) {
          throw new Error(`Dependency ${depName} not found for seeder ${seeder.entityName}`);
        }
        visit(depSeeder);
      }

      visiting.delete(seeder.entityName);
      visited.add(seeder.entityName);
      result.push(seeder);
    };

    for (const seeder of seeders) {
      visit(seeder);
    }

    return result;
  }

  /**
   * Create seed context for a branch
   */
  createSeedContext(branchId: string, options: Partial<SeedOptions> = {}, existingLogger?: SeedLogger): SeedContext {
    const prisma = new PrismaClient();
    const logger = existingLogger || new SeedLogger(LogLevel.INFO, options.verbose || false);
    
    const mergedOptions = {
      ...this.defaultOptions,
      ...options
    } as SeedOptions;

    return {
      prisma,
      branchId,
      schoolId: this.extractSchoolId(branchId),
      options: mergedOptions,
      createdEntities: new Map(),
      logger
    };
  }

  /**
   * Seed a single branch
   */
  async seedBranch(branchId: string, options: Partial<SeedOptions> = {}, existingContext?: SeedContext): Promise<OrchestrationResult> {
    const context = existingContext || this.createSeedContext(branchId, options);
    const startTime = new Date();
    const startMemory = process.memoryUsage();
    
    let totalSeeded = 0;
    const entityResults: Record<string, SeedResult> = {};
    const errors: Error[] = [];
    const warnings: string[] = [];

    try {
      context.logger.info(`Starting seed operation for branch: ${branchId}`);
      
      // Report overall progress
      context.logger.progress({
        entityName: 'overall',
        stage: 'preparing',
        processed: 0,
        total: this.getRegisteredSeeders().length,
        percentage: 0
      });

      const executionOrder = this.getExecutionOrder();
      
      for (let i = 0; i < executionOrder.length; i++) {
        const seeder = executionOrder[i];
        
        try {
          let result: SeedResult;
          
          if (context.options.dryRun) {
            // Simulate seeding without actual database changes
            result = {
              entityName: seeder.entityName,
              success: true,
              metrics: {
                totalRecords: 0,
                successCount: 0,
                errorCount: 0,
                startTime: new Date(),
                endTime: new Date(),
                duration: 0
              },
              errors: [],
              warnings: [],
              data: []
            };
          } else {
            // Execute actual seeding with retry logic
            result = await this.executeWithRetry(seeder, context);
          }
          
          entityResults[seeder.entityName] = result;
          
          if (result.success) {
            totalSeeded += result.metrics.totalRecords;
          } else {
            errors.push(...result.errors);
            warnings.push(...result.warnings);
          }
          
          // Report progress
          context.logger.progress({
            entityName: 'overall',
            stage: 'seeding',
            processed: i + 1,
            total: executionOrder.length,
            percentage: Math.round((i + 1) / executionOrder.length * 100)
          });
          
        } catch (error) {
          const seedError = error instanceof Error ? error : new Error(String(error));
          errors.push(seedError);
          
          entityResults[seeder.entityName] = {
            entityName: seeder.entityName,
            success: false,
            metrics: {
              totalRecords: 0,
              successCount: 0,
              errorCount: 1,
              startTime: new Date(),
              endTime: new Date(),
              duration: 0
            },
            errors: [seedError],
            warnings: [],
            data: []
          };
        }
      }

      context.logger.progress({
        entityName: 'overall',
        stage: 'completed',
        processed: executionOrder.length,
        total: executionOrder.length,
        percentage: 100
      });

      context.logger.info(`Seed operation completed for branch: ${branchId}`);

    } catch (error) {
      const seedError = error instanceof Error ? error : new Error(String(error));
      errors.push(seedError);
      context.logger.error('Seed operation failed', seedError);
    } finally {
      // Only disconnect if we created the context (not provided externally)
      if (!existingContext) {
        await context.prisma.$disconnect();
      }
    }

    const endTime = new Date();
    const endMemory = process.memoryUsage();
    
    const success = context.options.skipValidation ? true : errors.length === 0;

    return {
      success,
      totalSeeded,
      branchId,
      entityResults,
      errors,
      warnings,
      metrics: {
        totalRecords: totalSeeded,
        successCount: Object.values(entityResults).filter(r => r.success).length,
        errorCount: errors.length,
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
        memoryUsage: {
          rss: endMemory.rss - startMemory.rss,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal,
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          external: endMemory.external - startMemory.external,
          arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers
        }
      }
    };
  }

  /**
   * Seed multiple branches
   */
  async seedMultipleBranches(branchIds: string[], options: Partial<SeedOptions> = {}): Promise<OrchestrationResult[]> {
    const results: OrchestrationResult[] = [];
    
    for (const branchId of branchIds) {
      try {
        const result = await this.seedBranch(branchId, options);
        results.push(result);
      } catch (error) {
        const seedError = error instanceof Error ? error : new Error(String(error));
        results.push({
          success: false,
          totalSeeded: 0,
          branchId,
          entityResults: {},
          errors: [seedError],
          warnings: [],
          metrics: {
            totalRecords: 0,
            successCount: 0,
            errorCount: 1,
            startTime: new Date(),
            endTime: new Date(),
            duration: 0
          }
        });
      }
    }
    
    return results;
  }

  /**
   * Validate a branch's seeded data
   */
  async validateBranch(branchId: string, existingContext?: SeedContext): Promise<ValidationResult> {
    const context = existingContext || this.createSeedContext(branchId);
    const entityValidations: Record<string, boolean> = {};
    const errors: Error[] = [];
    const warnings: string[] = [];

    try {
      for (const seeder of this.getRegisteredSeeders()) {
        try {
          const isValid = await seeder.validate(context);
          entityValidations[seeder.entityName] = isValid;
          
          if (!isValid) {
            warnings.push(`Validation failed for entity: ${seeder.entityName}`);
          }
        } catch (error) {
          const validationError = error instanceof Error ? error : new Error(String(error));
          errors.push(validationError);
          entityValidations[seeder.entityName] = false;
        }
      }
    } finally {
      // Only disconnect if we created the context
      if (!existingContext) {
        await context.prisma.$disconnect();
      }
    }

    const success = errors.length === 0 && Object.values(entityValidations).every(v => v);

    return {
      success,
      branchId,
      entityValidations,
      errors,
      warnings
    };
  }

  /**
   * Cleanup operations for a branch
   */
  async cleanup(branchId: string, existingContext?: SeedContext): Promise<void> {
    const context = existingContext || this.createSeedContext(branchId);

    try {
      for (const seeder of this.getRegisteredSeeders()) {
        await seeder.cleanup(context);
      }
      
      context.logger.debug('Cleanup completed');
    } finally {
      // Only disconnect if we created the context
      if (!existingContext) {
        await context.prisma.$disconnect();
      }
    }
  }

  /**
   * Execute seeder with retry logic
   */
  private async executeWithRetry(seeder: ISeedEntity, context: SeedContext): Promise<SeedResult> {
    const maxRetries = context.options.maxRetries || 1;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await seeder.seed(context);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < maxRetries) {
          context.logger.warn(`Attempt ${attempt} failed for ${seeder.entityName}, retrying...`);
        }
      }
    }

    throw lastError;
  }

  /**
   * Extract school ID from branch ID
   */
  private extractSchoolId(branchId: string): string {
    // Extract school prefix from branch ID (e.g., 'dps-main' -> 'dps')
    const match = branchId.match(/^([^-]+)/);
    return match ? match[1] : 'unknown';
  }
}