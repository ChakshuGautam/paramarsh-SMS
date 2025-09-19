/**
 * FeeScheduleSeeder Tests - Direct Seeding
 * Tests fee schedule generation for fee structures
 */

import { FeeScheduleSeeder } from '../../entities/FeeScheduleSeeder';
import { TenantSeeder } from '../../entities/TenantSeeder';
import { ClassSeeder } from '../../entities/ClassSeeder';
import { FeeStructureSeeder } from '../../entities/FeeStructureSeeder';
import { SeedContext } from '../../core/interfaces';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run

describe('FeeScheduleSeeder - Direct Tests', () => {
  let seeder: FeeScheduleSeeder;
  let prisma: ReturnType<typeof getTestPrisma>;
  const testBranchId = 'test-direct-branch';

  beforeAll(async () => {
    prisma = getTestPrisma();
  });

  beforeEach(() => {
    seeder = new FeeScheduleSeeder();
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.feeSchedule.deleteMany({});
    await prisma.feeStructure.deleteMany({});
    await prisma.section.deleteMany({ where: { branchId: testBranchId } });
    await prisma.class.deleteMany({ where: { branchId: testBranchId } });
    await prisma.tenant.deleteMany({ where: { id: testBranchId } });
  });

  async function setupTestData(): Promise<SeedContext> {
    const context: SeedContext = {
      branchId: testBranchId,
      prisma,
      createdEntities: new Map(),
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        progress: jest.fn()
      } as any
    };

    // Create tenant
    const tenantSeeder = new TenantSeeder();
    const tenantResult = await tenantSeeder.seed(context);
    if (!tenantResult.success) {
      throw new Error(`Failed to create tenant: ${tenantResult.errors?.join(', ')}`);
    }

    // Create classes
    const classSeeder = new ClassSeeder();
    const classResult = await classSeeder.seed(context);
    if (!classResult.success) {
      throw new Error(`Failed to create classes: ${classResult.errors?.join(', ')}`);
    }

    // Create fee structures
    const feeStructureSeeder = new FeeStructureSeeder();
    const structureResult = await feeStructureSeeder.seed(context);
    if (!structureResult.success) {
      throw new Error(`Failed to create fee structures: ${structureResult.errors?.join(', ')}`);
    }

    return context;
  }

  describe('Basic Functionality', () => {
    it('should create fee schedules', async () => {
      const context = await setupTestData();
      
      const result = await seeder.seed(context);
      
      // Debug log any errors
      if (result.errors) {
        console.log('Seeding errors:', result.errors);
      }
      
      expect(result.success).toBe(true);
      expect(result.metrics.totalRecords).toBeGreaterThan(0);
      
      // Verify schedules were created
      const scheduleCount = await prisma.feeSchedule.count();
      
      console.log(`Created ${scheduleCount} fee schedules`);
      expect(scheduleCount).toBeGreaterThan(0);
    });

    it('should create schedules for each structure', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get a fee structure
      const structure = await prisma.feeStructure.findFirst({
        where: { branchId: testBranchId }
      });
      
      if (structure) {
        // Get schedules for this structure
        const schedules = await prisma.feeSchedule.findMany({
          where: { feeStructureId: structure.id }
        });
        
        // Should have schedules for the structure
        expect(schedules.length).toBeGreaterThan(0);
      }
    });

    it('should set appropriate recurrence types', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get all schedules
      const schedules = await prisma.feeSchedule.findMany({
        where: { branchId: testBranchId }
      });
      
      // Check for common recurrence types
      const recurrences = schedules.map(s => s.recurrence);
      expect(recurrences).toEqual(expect.arrayContaining([
        'monthly',
        'quarterly',
        'one-time'
      ]));
    });

    it('should set valid due dates', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get schedules
      const schedules = await prisma.feeSchedule.findMany({
        where: { branchId: testBranchId }
      });
      
      schedules.forEach(schedule => {
        // Due day should be between 1 and 28 (to avoid month-end issues)
        expect(schedule.dueDayOfMonth).toBeGreaterThanOrEqual(1);
        expect(schedule.dueDayOfMonth).toBeLessThanOrEqual(28);
      });
    });

    it('should set valid date ranges and status', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get schedules
      const schedules = await prisma.feeSchedule.findMany({
        where: { branchId: testBranchId }
      });
      
      schedules.forEach(schedule => {
        expect(schedule.startDate).toBeDefined();
        expect(schedule.status).toBe('active');
        // Monthly and quarterly should have end date, one-time may not
        if (schedule.recurrence !== 'one-time') {
          expect(schedule.endDate).toBeDefined();
        }
      });
    });
  });

  describe('Idempotency', () => {
    it('should not create duplicate schedules on multiple runs', async () => {
      const context = await setupTestData();
      
      // First run
      const result1 = await seeder.seed(context);
      const count1 = await prisma.feeSchedule.count();
      
      // Second run
      const result2 = await seeder.seed(context);
      const count2 = await prisma.feeSchedule.count();
      
      // Should not create duplicates
      expect(count2).toBe(count1);
      expect(result2.metrics.totalRecords).toBe(0); // No new records created
    });
  });

  describe('Performance', () => {
    it('should efficiently create fee schedules', async () => {
      const context = await setupTestData();
      
      const startTime = Date.now();
      const result = await seeder.seed(context);
      const duration = Date.now() - startTime;
      
      console.log(`Created ${result.metrics.successCount} schedules in ${duration}ms`);
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(5000); // 5 seconds
    });
  });
});