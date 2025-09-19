/**
 * Tests for AcademicYearSeeder entity
 * Following TDD methodology - tests first, implementation second
 */

import { AcademicYearSeeder } from '../../entities/AcademicYearSeeder';
import { SeedContext, SeedResult } from '../../core/interfaces';
import { createTestSeedContext, TestLogger, assertEntitiesExist } from '../test-helpers';
import { getTestPrisma } from '../setup';
import { cleanupBranchData, generateTestBranchId } from '../helpers/cleanup';
import '../setup'; // Import setup to ensure lifecycle hooks run

describe('AcademicYearSeeder', () => {
  let seeder: AcademicYearSeeder;
  let context: SeedContext;
  let testLogger: TestLogger;
  let testBranchId: string;
  let prisma: ReturnType<typeof getTestPrisma>;

  beforeEach(async () => {
    prisma = getTestPrisma();
    seeder = new AcademicYearSeeder();
    testLogger = new TestLogger();
    testBranchId = generateTestBranchId('test-ay');
    context = createTestSeedContext(testBranchId);
    context.logger = testLogger;
  });

  afterEach(async () => {
    // Clean up test data after each test
    await cleanupBranchData(prisma, testBranchId);
  });

  describe('Entity Configuration', () => {
    it('should have correct entity name', () => {
      expect(seeder.entityName).toBe('academicYears');
    });

    it('should have no dependencies', () => {
      expect(seeder.dependencies).toEqual([]);
    });

    it('should have appropriate batch size', () => {
      expect(seeder.batchSize).toBe(50); // Academic years are few, small batch size
    });
  });

  describe('Record Count Estimation', () => {
    it('should estimate 5 academic years for any branch', () => {
      expect(seeder.estimateRecordCount('test-dps-main')).toBe(5);
      expect(seeder.estimateRecordCount('test-kvs-central')).toBe(5);
      expect(seeder.estimateRecordCount('unknown-branch')).toBe(5);
    });
  });

  describe('Academic Year Data Generation', () => {
    it('should generate academic years spanning multiple years', async () => {
      const result = await seeder.seed(context);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(5);
      
      // Should have years from 2022-23 to 2026-27
      const years = result.data?.map(ay => ay.name);
      expect(years).toContain('2022-23');
      expect(years).toContain('2023-24');
      expect(years).toContain('2024-25');
      expect(years).toContain('2025-26');
      expect(years).toContain('2026-27');
    });

    it('should set current academic year (2024-25) as active', async () => {
      const result = await seeder.seed(context);
      
      const currentYear = result.data?.find(ay => ay.name === '2024-25');
      expect(currentYear).toBeDefined();
      expect(currentYear?.isActive).toBe(true);
      
      // Other years should not be active
      const otherYears = result.data?.filter(ay => ay.name !== '2024-25');
      otherYears?.forEach(year => {
        expect(year.isActive).toBe(false);
      });
    });

    it('should include branch ID in all academic years', async () => {
      const result = await seeder.seed(context);
      
      result.data?.forEach(academicYear => {
        expect(academicYear.branchId).toBe(testBranchId);
      });
    });

    it('should generate proper start and end dates', async () => {
      const result = await seeder.seed(context);
      
      const currentYear = result.data?.find(ay => ay.name === '2024-25');
      expect(currentYear).toBeDefined();
      expect(currentYear?.startDate).toBe('2024-04-01');
      expect(currentYear?.endDate).toBe('2025-03-31');
    });

    it('should handle different branch IDs', async () => {
      const anotherBranchId = generateTestBranchId('test-kvs');
      const kvsContext = createTestSeedContext(anotherBranchId);
      kvsContext.logger = testLogger;
      
      const result = await seeder.seed(kvsContext);
      
      expect(result.success).toBe(true);
      result.data?.forEach(academicYear => {
        expect(academicYear.branchId).toBe(anotherBranchId);
      });
      
      // Clean up this test's data
      await cleanupBranchData(prisma, anotherBranchId);
    });
  });

  describe('Database Operations', () => {
    it('should create academic years in database', async () => {
      const result = await seeder.seed(context);
      
      expect(result.success).toBe(true);
      
      const dbAcademicYears = await prisma.academicYear.findMany({
        where: { branchId: testBranchId },
        orderBy: { name: 'asc' }
      });
      
      expect(dbAcademicYears).toHaveLength(5);
      expect(dbAcademicYears[0].name).toBe('2022-23');
      expect(dbAcademicYears[4].name).toBe('2026-27');
      
      // Check that current year is active
      const activeYear = dbAcademicYears.find(ay => ay.isActive);
      expect(activeYear?.name).toBe('2024-25');
    });

    it('should not create duplicates when run multiple times', async () => {
      // First run
      await seeder.seed(context);
      
      // Second run - should not create duplicates
      const result = await seeder.seed(context);
      
      expect(result.success).toBe(true);
      
      const dbAcademicYears = await prisma.academicYear.findMany({
        where: { branchId: testBranchId }
      });
      
      // Should still have only 5 records
      expect(dbAcademicYears).toHaveLength(5);
    });
  });

  describe('Validation', () => {
    it('should validate successfully after seeding', async () => {
      await seeder.seed(context);
      
      const isValid = await seeder.validate(context);
      expect(isValid).toBe(true);
      
      const logs = testLogger.getLogsByLevel('info');
      expect(logs.some(log => log.message.includes('Validation passed'))).toBe(true);
    });

    it('should fail validation when no academic years exist', async () => {
      const isValid = await seeder.validate(context);
      expect(isValid).toBe(false);
      
      const warnings = testLogger.getLogsByLevel('warn');
      expect(warnings.some(log => log.message.includes('No records found'))).toBe(true);
    });
  });

  describe('Progress Tracking', () => {
    it('should report progress during seeding', async () => {
      const result = await seeder.seed(context);
      
      expect(result.success).toBe(true);
      
      const progressLogs = testLogger.getProgressLogs();
      expect(progressLogs.length).toBeGreaterThan(0);
      
      const completedProgress = progressLogs.find(p => p.stage === 'completed');
      expect(completedProgress).toBeDefined();
      expect(completedProgress?.percentage).toBe(100);
      expect(completedProgress?.entityName).toBe('academicYears');
    });

    it('should track timing metrics', async () => {
      const result = await seeder.seed(context);
      
      expect(result.metrics.startTime).toBeInstanceOf(Date);
      expect(result.metrics.endTime).toBeInstanceOf(Date);
      expect(result.metrics.duration).toBeGreaterThan(0);
      expect(result.metrics.totalRecords).toBe(5);
      expect(result.metrics.successCount).toBe(5);
      expect(result.metrics.errorCount).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Create a fresh seeder instance for this test
      const testSeeder = new AcademicYearSeeder();
      
      // Mock database error  
      const errorContext = {
        ...context,
        prisma: {
          academicYear: {
            findMany: jest.fn().mockRejectedValue(new Error('Database connection failed')),
            createMany: jest.fn().mockRejectedValue(new Error('Database connection failed')),
            count: jest.fn().mockRejectedValue(new Error('Database connection failed')),
            upsert: jest.fn().mockRejectedValue(new Error('Database connection failed')),
            create: jest.fn().mockRejectedValue(new Error('Database connection failed'))
          }
        } as any
      };
      
      // The seed method will throw an error
      await expect(testSeeder.seed(errorContext)).rejects.toThrow('Database connection failed');
    });

    it('should handle unique constraint violations', async () => {
      // First seed to create records
      await seeder.seed(context);
      
      // Try to seed again with same data - should handle gracefully
      const result = await seeder.seed(context);
      
      // Should still succeed due to idempotent implementation
      expect(result.success).toBe(true);
      expect(result.metrics.successCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Cleanup', () => {
    it('should handle cleanup gracefully', async () => {
      await expect(seeder.cleanup(context)).resolves.not.toThrow();
      
      const debugLogs = testLogger.getLogsByLevel('debug');
      expect(debugLogs.some(log => log.message.includes('No cleanup required'))).toBe(true);
    });
  });

  describe('Created Entities Storage', () => {
    it('should store created entities in context', async () => {
      const result = await seeder.seed(context);
      
      expect(result.success).toBe(true);
      expect(context.createdEntities.has('academicYears')).toBe(true);
      
      const createdEntities = context.createdEntities.get('academicYears');
      expect(createdEntities).toHaveLength(5);
      
      // Verify entities have required properties
      createdEntities?.forEach(entity => {
        expect(entity).toHaveProperty('id');
        expect(entity).toHaveProperty('name');
        expect(entity).toHaveProperty('branchId');
        expect(entity).toHaveProperty('isActive');
        expect(entity).toHaveProperty('startDate');
        expect(entity).toHaveProperty('endDate');
      });
    });
  });
});