/**
 * Base class for all seeders
 * Provides common functionality and interface
 */

import { SeedContext, SeedResult } from './interfaces';

export abstract class BaseSeeder {
  abstract entityName: string;
  abstract dependencies: string[];
  abstract priority: number;

  /**
   * Main seed method that wraps entity-specific logic
   */
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    
    // Check dependencies
    for (const dep of this.dependencies) {
      if (!context.createdEntities.has(dep)) {
        const endTime = new Date();
        return {
          success: false,
          entityName: this.entityName,
          data: [],
          metrics: {
            totalRecords: 0,
            successCount: 0,
            errorCount: 1,
            startTime: new Date(startTime),
            endTime,
            duration: endTime.getTime() - startTime
          },
          errors: [new Error(`Missing dependency: ${dep}`)],
          warnings: []
        };
      }
    }

    // Call entity-specific seed logic
    return this.seedEntity(context);
  }

  /**
   * Entity-specific seed logic to be implemented by subclasses
   */
  protected abstract seedEntity(context: SeedContext): Promise<SeedResult>;
}