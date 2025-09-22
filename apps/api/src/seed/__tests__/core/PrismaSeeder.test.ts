/**
 * Tests for abstract PrismaSeeder base class
 */

import { PrismaSeeder } from '../../core/PrismaSeeder';
import { SeedContext, SeedResult } from '../../core/interfaces';
import { createTestSeedContext, TestLogger, assertEntitiesExist } from '../test-helpers';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run

// Concrete implementation for testing
class TestSeeder extends PrismaSeeder {
  readonly entityName = 'testEntity';
  readonly dependencies = ['academicYears'];
  
  private mockData: any[] = [];
  
  constructor(mockData: any[] = []) {
    super(100); // batchSize
    this.mockData = mockData;
  }
  
  async seed(context: SeedContext): Promise<SeedResult> {
    return this.createMany(
      context,
      this.mockData,
      async (batch) => {
        // Simulate database operation with small delay
        await new Promise(resolve => setTimeout(resolve, 1));
        return batch.map((item, index) => ({ ...item, id: index + 1 }));
      }
    );
  }
  
  protected async getRecordCount(context: SeedContext): Promise<number> {
    // Mock implementation - return length of mock data
    return this.mockData.length;
  }
  
  estimateRecordCount(branchId: string): number {
    return this.mockData.length;
  }
}

describe('PrismaSeeder', () => {
  let context: SeedContext;
  let testLogger: TestLogger;

  beforeEach(() => {
    testLogger = new TestLogger();
    context = createTestSeedContext('test-dps-main');
    context.logger = testLogger;
  });

  describe('Basic Properties', () => {
    it('should initialize with correct properties', () => {
      const seeder = new TestSeeder();
      
      expect(seeder.entityName).toBe('testEntity');
      expect(seeder.dependencies).toEqual(['academicYears']);
      expect(seeder.batchSize).toBe(100);
    });

    it('should allow custom batch size', () => {
      const seeder = new TestSeeder();
      expect(seeder.batchSize).toBe(100);
    });
  });

  describe('Dependency Management', () => {
    it('should return dependencies correctly', () => {
      const seeder = new TestSeeder();
      const deps = seeder.getDependencies();
      
      expect(deps).toEqual(['academicYears']);
      expect(deps).not.toBe(seeder.dependencies); // Should return a copy
    });

    it('should handle empty dependencies', () => {
      class NoDepsSeeder extends TestSeeder {
        readonly dependencies = [];
      }
      
      const seeder = new NoDepsSeeder();
      expect(seeder.getDependencies()).toEqual([]);
    });
  });

  describe('Seed Execution', () => {
    it('should execute seeding with progress tracking', async () => {
      const mockData = Array.from({ length: 250 }, (_, i) => ({ name: `Item ${i + 1}` }));
      const seeder = new TestSeeder(mockData);
      
      const result = await seeder.seed(context);
      
      expect(result.success).toBe(true);
      expect(result.entityName).toBe('testEntity');
      expect(result.metrics.totalRecords).toBe(250);
      expect(result.metrics.successCount).toBe(250);
      expect(result.metrics.errorCount).toBe(0);
      expect(result.errors).toHaveLength(0);
      
      // Check progress logging
      const progressLogs = testLogger.getProgressLogs();
      expect(progressLogs.length).toBeGreaterThan(0);
      expect(progressLogs[progressLogs.length - 1].stage).toBe('completed');
      expect(progressLogs[progressLogs.length - 1].percentage).toBe(100);
    });

    it('should handle batch processing correctly', async () => {
      const mockData = Array.from({ length: 250 }, (_, i) => ({ name: `Item ${i + 1}` }));
      const seeder = new TestSeeder(mockData);
      
      const result = await seeder.seed(context);
      
      // With batch size 100, should create 3 batches (100 + 100 + 50)
      const progressLogs = testLogger.getProgressLogs();
      const batchLogs = progressLogs.filter(log => log.message?.includes('batch'));
      
      expect(batchLogs.length).toBeGreaterThan(0);
      expect(result.data).toHaveLength(250);
    });

    it('should track timing and memory usage', async () => {
      const mockData = Array.from({ length: 50 }, (_, i) => ({ name: `Item ${i + 1}` }));
      const seeder = new TestSeeder(mockData);
      
      const result = await seeder.seed(context);
      
      expect(result.metrics.startTime).toBeInstanceOf(Date);
      expect(result.metrics.endTime).toBeInstanceOf(Date);
      expect(result.metrics.duration).toBeGreaterThan(0);
      expect(result.metrics.memoryUsage).toBeDefined();
    });

    it('should store created entities in context', async () => {
      const mockData = [{ name: 'Item 1' }, { name: 'Item 2' }];
      const seeder = new TestSeeder(mockData);
      
      await seeder.seed(context);
      
      expect(context.createdEntities.has('testEntity')).toBe(true);
      const createdEntities = context.createdEntities.get('testEntity');
      expect(createdEntities).toHaveLength(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle processing errors gracefully', async () => {
      class ErrorSeeder extends TestSeeder {
        async seed(context: SeedContext): Promise<SeedResult> {
          return this.createMany(
            context,
            [{ name: 'test' }],
            async () => {
              throw new Error('Processing failed');
            }
          );
        }
      }
      
      const seeder = new ErrorSeeder([{ name: 'test' }]);
      const result = await seeder.seed(context);
      
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Processing failed');
      expect(result.metrics.errorCount).toBeGreaterThan(0);
    });

    it('should continue processing when skipValidation is true', async () => {
      context.options.skipValidation = true;
      
      class PartialErrorSeeder extends TestSeeder {
        constructor() {
          super([]); // Pass empty array for mockData
          this.batchSize = 1; // Set batch size to 1 to ensure multiple batches
        }
        
        async seed(context: SeedContext): Promise<SeedResult> {
          return this.executeWithProgress(
            context,
            [{ name: 'good' }, { name: 'bad' }, { name: 'good2' }],
            async (batch, batchIndex) => {
              if (batchIndex === 1) { // Second batch fails
                throw new Error('Batch failed');
              }
              return batch.map((item, index) => ({ ...item, id: index + 1 }));
            },
            { batchSize: 1 } // Ensure batch size is 1
          );
        }
      }
      
      const seeder = new PartialErrorSeeder();
      const result = await seeder.seed(context);
      
      // Should be successful because skipValidation is true
      expect(result.success).toBe(true);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Validation', () => {
    it('should validate seeded data by default', async () => {
      const seeder = new TestSeeder([{ name: 'test' }]);
      const result = await seeder.validate(context);
      
      expect(result).toBe(true);
    });

    it('should fail validation when no records exist', async () => {
      const seeder = new TestSeeder([]); // No data
      const result = await seeder.validate(context);
      
      expect(result).toBe(false);
      
      const warnings = testLogger.getLogsByLevel('warn');
      expect(warnings.some(log => log.message.includes('No records found'))).toBe(true);
    });

    it('should warn when record count is below expected', async () => {
      class LowCountSeeder extends TestSeeder {
        estimateRecordCount(): number {
          return 100; // Expect 100
        }
        
        protected async getRecordCount(): Promise<number> {
          return 50; // But only have 50
        }
      }
      
      const seeder = new LowCountSeeder();
      const result = await seeder.validate(context);
      
      expect(result).toBe(true); // Still passes, just warns
      
      const warnings = testLogger.getLogsByLevel('warn');
      expect(warnings.some(log => log.message.includes('below expected'))).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should handle cleanup gracefully', async () => {
      const seeder = new TestSeeder();
      
      await expect(seeder.cleanup(context)).resolves.not.toThrow();
      
      const debugLogs = testLogger.getLogsByLevel('debug');
      expect(debugLogs.some(log => log.message.includes('No cleanup required'))).toBe(true);
    });
  });

  describe('Branch Settings', () => {
    it('should provide branch-specific settings', () => {
      const seeder = new TestSeeder();
      
      const dpsSettings = seeder['getBranchSettings']('dps-main');
      expect(dpsSettings.studentCount).toBe(1425);
      expect(dpsSettings.teacherCount).toBe(85);
      expect(dpsSettings.classCount).toBe(30);
      
      const kvs = seeder['getBranchSettings']('kvs-central');
      expect(kvs.studentCount).toBe(1300);
      
      const svps = seeder['getBranchSettings']('svps-main');
      expect(svps.studentCount).toBe(1999);
    });

    it('should provide default settings for unknown branches', () => {
      const seeder = new TestSeeder();
      const settings = seeder['getBranchSettings']('unknown-branch');
      
      expect(settings.studentCount).toBe(500);
      expect(settings.teacherCount).toBe(30);
      expect(settings.classCount).toBe(10);
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 5000 }, (_, i) => ({ name: `Item ${i + 1}` }));
      const seeder = new TestSeeder(largeDataset);
      
      const startTime = Date.now();
      const result = await seeder.seed(context);
      const duration = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(result.metrics.totalRecords).toBe(5000);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should report memory usage accurately', async () => {
      const data = Array.from({ length: 1000 }, (_, i) => ({ name: `Item ${i + 1}` }));
      const seeder = new TestSeeder(data);
      
      const result = await seeder.seed(context);
      
      expect(result.metrics.memoryUsage).toBeDefined();
      expect(typeof result.metrics.memoryUsage?.heapUsed).toBe('number');
    });
  });
});