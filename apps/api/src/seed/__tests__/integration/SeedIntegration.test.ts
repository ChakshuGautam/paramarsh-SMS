/**
 * Integration Tests for Seed Data Manager v3.0
 * End-to-end testing of the complete seeding architecture
 * Following TDD methodology - comprehensive scenarios
 */

import { ModularSeedOrchestrator } from '../../core/ModularSeedOrchestrator';
import { AcademicYearSeeder } from '../../entities/AcademicYearSeeder';
import { SeedContext, SeedOptions } from '../../core/interfaces';
import { createTestSeedContext, TestLogger, measureExecutionTime } from '../test-helpers';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run

describe('Seed Data Manager v3.0 - Integration Tests', () => {
  let orchestrator: ModularSeedOrchestrator;
  let testLogger: TestLogger;
  let context: SeedContext;

  beforeEach(() => {
    testLogger = new TestLogger();
    context = createTestSeedContext('test-dps-main');
    context.logger = testLogger;
    orchestrator = new ModularSeedOrchestrator();
  });

  describe('End-to-End Seeding Flow', () => {
    it('should complete full seeding workflow with validation', async () => {
      // Setup: Register seeders
      const academicYearSeeder = new AcademicYearSeeder();
      orchestrator.registerSeeder(academicYearSeeder);

      // Act: Execute full workflow
      const seedResult = await orchestrator.seedBranch('test-dps-main', {
        verbose: true,
        skipValidation: false
      });

      // Validate seeding results
      expect(seedResult.success).toBe(true);
      expect(seedResult.totalSeeded).toBe(5); // 5 academic years
      expect(seedResult.entityResults.academicYears.success).toBe(true);
      expect(seedResult.metrics.duration).toBeGreaterThan(0);

      // Validate database state
      const prisma = getTestPrisma();
      const academicYearCount = await prisma.academicYear.count({
        where: { branchId: 'test-dps-main' }
      });
      expect(academicYearCount).toBe(5);

      // Validate post-seeding validation
      const validationResult = await orchestrator.validateBranch('test-dps-main');
      expect(validationResult.success).toBe(true);
      expect(validationResult.entityValidations.academicYears).toBe(true);

      // Cleanup should work
      await expect(orchestrator.cleanup('test-dps-main')).resolves.not.toThrow();
    });

    it('should handle multi-branch seeding with complete isolation', async () => {
      const academicYearSeeder = new AcademicYearSeeder();
      orchestrator.registerSeeder(academicYearSeeder);

      const branches = ['test-dps-main', 'test-kvs-central', 'test-aps-north'];
      
      // Seed multiple branches
      const results = await orchestrator.seedMultipleBranches(branches, {
        verbose: false,
        batchSize: 50
      });

      // Validate all branches succeeded
      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.branchId).toBe(branches[index]);
        expect(result.totalSeeded).toBe(5);
      });

      // Validate data isolation
      const prisma = getTestPrisma();
      
      for (const branchId of branches) {
        const branchRecords = await prisma.academicYear.count({
          where: { branchId }
        });
        expect(branchRecords).toBe(5);

        // Validate branch-specific record IDs
        const records = await prisma.academicYear.findMany({
          where: { branchId },
          select: { id: true }
        });
        
        records.forEach(record => {
          expect(record.id).toContain(branchId);
        });
      }

      // Validate total isolation
      const totalRecords = await prisma.academicYear.count();
      expect(totalRecords).toBe(15); // 5 per branch × 3 branches
    });

    it('should handle performance requirements with large datasets', async () => {
      const academicYearSeeder = new AcademicYearSeeder();
      orchestrator.registerSeeder(academicYearSeeder);

      const { result, duration, memoryUsage } = await measureExecutionTime(async () => {
        return orchestrator.seedBranch('test-dps-main', {
          batchSize: 10, // Smaller batches for testing
          verbose: false
        });
      });

      expect(result.success).toBe(true);
      
      // Performance assertions
      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
      expect(memoryUsage.heapUsed).toBeLessThan(100 * 1024 * 1024); // Under 100MB heap increase
      
      // Metrics should be tracked
      expect(result.metrics.duration).toBeGreaterThan(0);
      expect(result.metrics.memoryUsage).toBeDefined();
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should recover from transient failures with retry logic', async () => {
      let attemptCount = 0;
      
      class FlakySeeeder extends AcademicYearSeeder {
        async seed(context: SeedContext) {
          attemptCount++;
          if (attemptCount < 2) {
            throw new Error('Transient network error');
          }
          return super.seed(context);
        }
      }

      const flakySeeder = new FlakySeeeder();
      orchestrator.registerSeeder(flakySeeder);

      const result = await orchestrator.seedBranch('test-dps-main', {
        maxRetries: 3
      });

      expect(result.success).toBe(true);
      expect(attemptCount).toBe(2); // Should have retried once
      
      // Validate data was actually created
      const prisma = getTestPrisma();
      const recordCount = await prisma.academicYear.count({
        where: { branchId: 'test-dps-main' }
      });
      expect(recordCount).toBe(5);
    });

    it('should provide detailed error information on failures', async () => {
      class AlwaysFailSeeder extends AcademicYearSeeder {
        readonly entityName = 'alwaysFails';
        
        async seed(): Promise<any> {
          throw new Error('Persistent failure with detailed context');
        }
      }

      const failingSeeder = new AlwaysFailSeeder();
      orchestrator.registerSeeder(failingSeeder);

      const result = await orchestrator.seedBranch('test-dps-main', {
        maxRetries: 1
      });

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Persistent failure with detailed context');
      expect(result.entityResults.alwaysFails.success).toBe(false);
      expect(result.entityResults.alwaysFails.errors).toHaveLength(1);
    });

    it('should handle partial failures in multi-seeder scenarios', async () => {
      const academicYearSeeder = new AcademicYearSeeder();
      
      class PartialFailSeeder extends AcademicYearSeeder {
        readonly entityName = 'partialFail';
        readonly dependencies = ['academicYears']; // Depends on academic years
        
        async seed(): Promise<any> {
          throw new Error('This seeder always fails');
        }
      }

      orchestrator.registerSeeders([academicYearSeeder, new PartialFailSeeder()]);

      const result = await orchestrator.seedBranch('test-dps-main', {
        skipValidation: true // Continue despite failures
      });

      // Overall should be successful due to skipValidation
      expect(result.success).toBe(true);
      expect(result.errors.length).toBeGreaterThan(0);
      
      // Academic years should succeed
      expect(result.entityResults.academicYears.success).toBe(true);
      expect(result.entityResults.academicYears.metrics.totalRecords).toBe(5);
      
      // Partial fail should fail
      expect(result.entityResults.partialFail.success).toBe(false);
    });
  });

  describe('Progress Monitoring and Observability', () => {
    it('should provide real-time progress updates', async () => {
      const academicYearSeeder = new AcademicYearSeeder();
      orchestrator.registerSeeder(academicYearSeeder);

      await orchestrator.seedBranch('test-dps-main', {
        verbose: true
      }, context);

      // Validate progress tracking
      const progressLogs = testLogger.getProgressLogs();
      expect(progressLogs.length).toBeGreaterThan(0);

      // Should have overall progress
      const overallProgress = progressLogs.filter(p => p.entityName === 'overall');
      expect(overallProgress.length).toBeGreaterThan(0);

      // Should show progress stages
      const stages = overallProgress.map(p => p.stage);
      expect(stages).toContain('preparing');
      expect(stages).toContain('seeding');
      expect(stages).toContain('completed');
    });

    it('should track detailed metrics for performance analysis', async () => {
      const academicYearSeeder = new AcademicYearSeeder();
      orchestrator.registerSeeder(academicYearSeeder);

      const result = await orchestrator.seedBranch('test-dps-main');

      // Validate comprehensive metrics
      expect(result.metrics).toEqual(
        expect.objectContaining({
          totalRecords: expect.any(Number),
          successCount: expect.any(Number),
          errorCount: expect.any(Number),
          startTime: expect.any(Date),
          endTime: expect.any(Date),
          duration: expect.any(Number),
          memoryUsage: expect.objectContaining({
            rss: expect.any(Number),
            heapTotal: expect.any(Number),
            heapUsed: expect.any(Number),
            external: expect.any(Number),
            arrayBuffers: expect.any(Number)
          })
        })
      );

      // Entity-level metrics
      expect(result.entityResults.academicYears.metrics).toEqual(
        expect.objectContaining({
          totalRecords: 5,
          successCount: 5,
          errorCount: 0,
          startTime: expect.any(Date),
          endTime: expect.any(Date),
          duration: expect.any(Number)
        })
      );
    });

    it('should provide comprehensive logging for debugging', async () => {
      const academicYearSeeder = new AcademicYearSeeder();
      orchestrator.registerSeeder(academicYearSeeder);

      await orchestrator.seedBranch('test-dps-main', {
        verbose: true
      }, context);

      const infoLogs = testLogger.getLogsByLevel('info');
      
      // Should log operation start and completion
      expect(infoLogs.some(log => 
        log.message.includes('Starting seed operation')
      )).toBe(true);
      
      expect(infoLogs.some(log => 
        log.message.includes('Seed operation completed')
      )).toBe(true);
      
      // Should log academic years seeding
      expect(infoLogs.some(log => 
        log.message.includes('Starting academic years seeding')
      )).toBe(true);

      // Should not have errors or warnings for successful operation
      expect(testLogger.hasErrorsOrWarnings()).toBe(false);
    });
  });

  describe('Data Validation and Integrity', () => {
    it('should validate data integrity across all entities', async () => {
      const academicYearSeeder = new AcademicYearSeeder();
      orchestrator.registerSeeder(academicYearSeeder);

      await orchestrator.seedBranch('test-dps-main');

      const validationResult = await orchestrator.validateBranch('test-dps-main');
      
      expect(validationResult.success).toBe(true);
      expect(validationResult.entityValidations.academicYears).toBe(true);
      expect(validationResult.errors).toHaveLength(0);
      expect(validationResult.warnings).toHaveLength(0);

      // Validate actual data structure
      const prisma = getTestPrisma();
      const academicYears = await prisma.academicYear.findMany({
        where: { branchId: 'test-dps-main' },
        orderBy: { name: 'asc' }
      });

      expect(academicYears).toHaveLength(5);
      
      // Validate academic year structure
      academicYears.forEach((ay, index) => {
        expect(ay.branchId).toBe('test-dps-main');
        expect(ay.name).toMatch(/^\d{4}-\d{2}$/); // Format: 2022-23
        expect(ay.startDate).toBeDefined();
        expect(ay.endDate).toBeDefined();
        expect(typeof ay.isActive).toBe('boolean');
      });

      // Only one should be active (current year)
      const activeYears = academicYears.filter(ay => ay.isActive);
      expect(activeYears).toHaveLength(1);
      expect(activeYears[0].name).toBe('2024-25'); // Current year
    });

    it('should enforce data isolation between branches', async () => {
      const academicYearSeeder = new AcademicYearSeeder();
      orchestrator.registerSeeder(academicYearSeeder);

      // Seed two branches
      await orchestrator.seedBranch('test-dps-main');
      await orchestrator.seedBranch('test-kvs-central');

      const prisma = getTestPrisma();
      
      // Validate no cross-contamination
      const dpsRecords = await prisma.academicYear.findMany({
        where: { branchId: 'test-dps-main' }
      });
      
      const kvsRecords = await prisma.academicYear.findMany({
        where: { branchId: 'test-kvs-central' }
      });

      // Both should have their own records
      expect(dpsRecords).toHaveLength(5);
      expect(kvsRecords).toHaveLength(5);

      // IDs should be branch-specific
      dpsRecords.forEach(record => {
        expect(record.id).toContain('test-dps-main');
        expect(record.branchId).toBe('test-dps-main');
      });

      kvsRecords.forEach(record => {
        expect(record.id).toContain('test-kvs-central');
        expect(record.branchId).toBe('test-kvs-central');
      });

      // No overlap in IDs
      const dpsIds = new Set(dpsRecords.map(r => r.id));
      const kvsIds = new Set(kvsRecords.map(r => r.id));
      const intersection = new Set([...dpsIds].filter(id => kvsIds.has(id)));
      expect(intersection.size).toBe(0);
    });
  });

  describe('Configuration and Options', () => {
    it('should respect batch size configuration', async () => {
      const academicYearSeeder = new AcademicYearSeeder();
      orchestrator.registerSeeder(academicYearSeeder);

      // Test with different batch sizes
      const smallBatchResult = await orchestrator.seedBranch('test-dps-main', {
        batchSize: 2
      });

      expect(smallBatchResult.success).toBe(true);
      expect(smallBatchResult.totalSeeded).toBe(5);

      // Verify data was created correctly despite smaller batches
      const prisma = getTestPrisma();
      const recordCount = await prisma.academicYear.count({
        where: { branchId: 'test-dps-main' }
      });
      expect(recordCount).toBe(5);
    });

    it('should handle dry run mode without making database changes', async () => {
      const academicYearSeeder = new AcademicYearSeeder();
      orchestrator.registerSeeder(academicYearSeeder);

      const result = await orchestrator.seedBranch('test-dps-main', {
        dryRun: true
      });

      expect(result.success).toBe(true);
      expect(result.totalSeeded).toBe(0); // No actual records in dry run

      // Verify no records were created
      const prisma = getTestPrisma();
      const recordCount = await prisma.academicYear.count({
        where: { branchId: 'test-dps-main' }
      });
      expect(recordCount).toBe(0);
    });

    it('should merge orchestrator defaults with operation options', async () => {
      const customOrchestrator = new ModularSeedOrchestrator({
        batchSize: 200,
        verbose: true,
        maxRetries: 5
      });

      const academicYearSeeder = new AcademicYearSeeder();
      customOrchestrator.registerSeeder(academicYearSeeder);

      const testContext = customOrchestrator.createSeedContext('test-dps-main', {
        skipValidation: true // Override one option
      });

      // Validate merged options
      expect(testContext.options.batchSize).toBe(200); // From defaults
      expect(testContext.options.verbose).toBe(true); // From defaults
      expect(testContext.options.maxRetries).toBe(5); // From defaults
      expect(testContext.options.skipValidation).toBe(true); // From override
      expect(testContext.options.dryRun).toBe(false); // System default
    });
  });

  describe('Resource Management', () => {
    it('should properly manage database connections', async () => {
      const academicYearSeeder = new AcademicYearSeeder();
      orchestrator.registerSeeder(academicYearSeeder);

      // Execute multiple operations
      await orchestrator.seedBranch('test-dps-main');
      await orchestrator.validateBranch('test-dps-main');
      await orchestrator.cleanup('test-dps-main');

      // Should not throw connection errors
      expect(true).toBe(true); // If we get here, connections were managed properly
    });

    it('should handle concurrent seeding operations', async () => {
      const orchestrator1 = new ModularSeedOrchestrator();
      const orchestrator2 = new ModularSeedOrchestrator();

      const seeder1 = new AcademicYearSeeder();
      const seeder2 = new AcademicYearSeeder();

      orchestrator1.registerSeeder(seeder1);
      orchestrator2.registerSeeder(seeder2);

      // Run concurrent operations on different branches
      const [result1, result2] = await Promise.all([
        orchestrator1.seedBranch('test-dps-main'),
        orchestrator2.seedBranch('test-kvs-central')
      ]);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      // Validate both branches have their data
      const prisma = getTestPrisma();
      const dpsCount = await prisma.academicYear.count({
        where: { branchId: 'test-dps-main' }
      });
      const kvsCount = await prisma.academicYear.count({
        where: { branchId: 'test-kvs-central' }
      });

      expect(dpsCount).toBe(5);
      expect(kvsCount).toBe(5);
    });
  });
});