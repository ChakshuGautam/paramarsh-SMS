/**
 * Abstract base class for all Prisma-based seeders
 * Following V3-IMPLEMENTATION-SPEC.md
 */

import { PrismaClient } from '@prisma/client';
import { 
  ISeedEntity, 
  SeedContext, 
  SeedResult, 
  SeedMetrics, 
  SeedProgress,
  SeedOptions 
} from './interfaces';
import { SeedLogger } from './SeedLogger';

export abstract class PrismaSeeder implements ISeedEntity {
  abstract readonly entityName: string;
  abstract readonly dependencies: string[];
  public readonly batchSize: number = 1000;

  constructor(
    protected readonly defaultBatchSize: number = 1000
  ) {
    this.batchSize = defaultBatchSize;
  }

  /**
   * Main seeding method - must be implemented by concrete seeders
   */
  abstract seed(context: SeedContext): Promise<SeedResult>;

  /**
   * Validate the seeded data - default implementation checks count
   */
  async validate(context: SeedContext): Promise<boolean> {
    try {
      const count = await this.getRecordCount(context);
      const expected = this.estimateRecordCount(context.branchId);
      
      if (count === 0) {
        context.logger.warn(`No records found for ${this.entityName}`);
        return false;
      }

      if (count < expected * 0.8) { // Allow 20% variance
        context.logger.warn(
          `Record count below expected for ${this.entityName}`,
          { actual: count, expected, variance: ((expected - count) / expected * 100).toFixed(1) + '%' }
        );
      }

      context.logger.info(`Validation passed for ${this.entityName}`, { count, expected });
      return true;
    } catch (error) {
      context.logger.error(`Validation failed for ${this.entityName}`, error as Error);
      return false;
    }
  }

  /**
   * Cleanup method - override if needed
   */
  async cleanup(context: SeedContext): Promise<void> {
    // Default: no cleanup needed
    context.logger.debug(`No cleanup required for ${this.entityName}`);
  }

  /**
   * Get dependencies for this seeder
   */
  getDependencies(): string[] {
    return [...this.dependencies];
  }

  /**
   * Estimate record count for planning - must be implemented
   */
  abstract estimateRecordCount(branchId: string): number;

  /**
   * Protected helper methods for concrete implementations
   */
  
  /**
   * Execute seeding with progress tracking and error handling
   */
  protected async executeWithProgress<T>(
    context: SeedContext,
    data: T[],
    processor: (batch: T[], batchIndex: number) => Promise<any[]>,
    options: { 
      batchSize?: number;
      entityName?: string;
      stage?: string;
    } = {}
  ): Promise<SeedResult> {
    const startTime = new Date();
    const entityName = options.entityName || this.entityName;
    const batchSize = options.batchSize || this.batchSize;
    const stage = options.stage || 'seeding';
    
    const metrics: SeedMetrics = {
      totalRecords: data.length,
      successCount: 0,
      errorCount: 0,
      startTime,
    };

    const result: SeedResult = {
      entityName,
      success: false,
      metrics,
      errors: [],
      warnings: [],
      data: []
    };

    try {
      const totalBatches = Math.ceil(data.length / batchSize);
      
      context.logger.info(`Starting ${stage} for ${entityName}`, {
        totalRecords: data.length,
        batchSize,
        totalBatches
      });

      for (let i = 0; i < totalBatches; i++) {
        const startIdx = i * batchSize;
        const endIdx = Math.min(startIdx + batchSize, data.length);
        const batch = data.slice(startIdx, endIdx);
        
        // Report progress
        const progress: SeedProgress = {
          entityName,
          stage: stage as any,
          processed: startIdx,
          total: data.length,
          percentage: Math.round((startIdx / data.length) * 100),
          currentBatch: i + 1,
          totalBatches,
          message: `Processing batch ${i + 1}/${totalBatches} (${batch.length} records)`
        };
        
        context.logger.progress(progress);

        try {
          const batchResult = await processor(batch, i);
          metrics.successCount += batchResult.length;
          result.data?.push(...batchResult);
          
          // Store created entities for dependencies
          if (!context.createdEntities.has(entityName)) {
            context.createdEntities.set(entityName, []);
          }
          context.createdEntities.get(entityName)?.push(...batchResult);
          
        } catch (error) {
          metrics.errorCount += batch.length;
          result.errors.push(error as Error);
          context.logger.error(`Batch ${i + 1} failed for ${entityName}`, error as Error);
          
          if (!context.options.skipValidation) {
            throw error; // Fail fast if validation is not skipped
          }
        }
      }

      // Final progress
      const finalProgress: SeedProgress = {
        entityName,
        stage: 'completed',
        processed: data.length,
        total: data.length,
        percentage: 100,
        message: `Completed ${entityName} seeding`
      };
      
      context.logger.progress(finalProgress);

      metrics.endTime = new Date();
      metrics.duration = metrics.endTime.getTime() - startTime.getTime();
      metrics.memoryUsage = process.memoryUsage();

      result.success = metrics.errorCount === 0 || context.options.skipValidation;
      
      context.logger.info(`${stage} completed for ${entityName}`, {
        success: result.success,
        successCount: metrics.successCount,
        errorCount: metrics.errorCount,
        duration: metrics.duration
      });

      return result;
      
    } catch (error) {
      metrics.endTime = new Date();
      metrics.duration = metrics.endTime.getTime() - startTime.getTime();
      
      result.success = false;
      // Only add error if it's not already in the list
      if (!result.errors.find(e => e === error)) {
        result.errors.push(error as Error);
      }
      
      context.logger.error(`${stage} failed for ${entityName}`, error as Error);
      
      return result;
    }
  }

  /**
   * Create entities in batches using Prisma createMany
   */
  protected async createMany<T>(
    context: SeedContext,
    data: T[],
    createFn: (batch: T[]) => Promise<any>
  ): Promise<SeedResult> {
    return this.executeWithProgress(
      context,
      data,
      async (batch, batchIndex) => {
        const result = await createFn(batch);
        return Array.isArray(result) ? result : [result];
      }
    );
  }

  /**
   * Get current record count for this entity
   */
  protected abstract getRecordCount(context: SeedContext): Promise<number>;

  /**
   * Generate branch-specific data - utility for seeders
   */
  protected getBranchSettings(branchId: string): {
    studentCount: number;
    teacherCount: number;
    classCount: number;
    settings: Record<string, any>;
  } {
    // Default settings - can be overridden by specific seeders
    const baseSettings = {
      'dps-main': { studentCount: 1425, teacherCount: 85, classCount: 30 },
      'dps-east': { studentCount: 1200, teacherCount: 72, classCount: 25 },
      'dps-west': { studentCount: 1100, teacherCount: 66, classCount: 22 },
      'dps-north': { studentCount: 980, teacherCount: 58, classCount: 20 },
      'dps-south': { studentCount: 890, teacherCount: 53, classCount: 18 },
      'kvs-central': { studentCount: 1300, teacherCount: 78, classCount: 28 },
      'kvs-cantonment': { studentCount: 950, teacherCount: 57, classCount: 19 },
      'kvs-airport': { studentCount: 850, teacherCount: 51, classCount: 17 },
      'sps-primary': { studentCount: 600, teacherCount: 36, classCount: 12 },
      'sps-secondary': { studentCount: 800, teacherCount: 48, classCount: 16 },
      'sps-senior': { studentCount: 400, teacherCount: 24, classCount: 8 },
      'svps-main': { studentCount: 1999, teacherCount: 31, classCount: 15 },
      'svps-junior': { studentCount: 935, teacherCount: 20, classCount: 11 },
      'svps-senior': { studentCount: 362, teacherCount: 10, classCount: 4 },
      'ris-main': { studentCount: 750, teacherCount: 45, classCount: 15 },
      'ris-extension': { studentCount: 550, teacherCount: 33, classCount: 11 }
    };

    const setting = baseSettings[branchId as keyof typeof baseSettings] || {
      studentCount: 500,
      teacherCount: 30,
      classCount: 10
    };
    
    return {
      ...setting,
      settings: {}
    };
  }
}