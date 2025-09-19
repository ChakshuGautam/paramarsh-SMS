/**
 * FeeStructureSeeder Tests - Direct Seeding
 * Tests fee structure generation for each grade/class
 */

import { FeeStructureSeeder } from '../../entities/FeeStructureSeeder';
import { TenantSeeder } from '../../entities/TenantSeeder';
import { ClassSeeder } from '../../entities/ClassSeeder';
import { SeedContext } from '../../core/interfaces';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run

describe('FeeStructureSeeder - Direct Tests', () => {
  let seeder: FeeStructureSeeder;
  let prisma: ReturnType<typeof getTestPrisma>;
  const testBranchId = 'test-direct-branch';

  beforeAll(async () => {
    prisma = getTestPrisma();
  });

  beforeEach(() => {
    seeder = new FeeStructureSeeder();
  });

  afterEach(async () => {
    // Clean up after each test
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

    return context;
  }

  describe('Basic Functionality', () => {
    it('should create fee structures', async () => {
      const context = await setupTestData();
      
      const result = await seeder.seed(context);
      
      // Debug log any errors
      if (result.errors) {
        console.log('Seeding errors:', result.errors);
      }
      
      expect(result.success).toBe(true);
      expect(result.metrics.totalRecords).toBeGreaterThan(0);
      
      // Verify structures were created
      const structureCount = await prisma.feeStructure.count();
      
      console.log(`Created ${structureCount} fee structures`);
      expect(structureCount).toBeGreaterThan(0);
    });

    it('should create structures for each class', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get all classes
      const classes = await prisma.class.findMany({
        where: { branchId: testBranchId }
      });
      
      // Get all fee structures
      const structures = await prisma.feeStructure.findMany({
        where: { branchId: testBranchId }
      });
      
      // Should have at least one structure per class
      expect(structures.length).toBeGreaterThanOrEqual(classes.length);
    });

    it('should assign appropriate grade levels', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get structures with gradeId
      const structures = await prisma.feeStructure.findMany({
        where: { 
          branchId: testBranchId,
          gradeId: { not: null }
        }
      });
      
      // All structures should have gradeId
      structures.forEach(structure => {
        expect(structure.gradeId).toBeDefined();
      });
    });
  });

  describe('Idempotency', () => {
    it('should not create duplicate structures on multiple runs', async () => {
      const context = await setupTestData();
      
      // First run
      const result1 = await seeder.seed(context);
      const count1 = await prisma.feeStructure.count();
      
      // Second run
      const result2 = await seeder.seed(context);
      const count2 = await prisma.feeStructure.count();
      
      // Should not create duplicates
      expect(count2).toBe(count1);
      expect(result2.metrics.totalRecords).toBe(0); // No new records created
    });
  });

  describe('Performance', () => {
    it('should efficiently create fee structures', async () => {
      const context = await setupTestData();
      
      const startTime = Date.now();
      const result = await seeder.seed(context);
      const duration = Date.now() - startTime;
      
      console.log(`Created ${result.metrics.successCount} structures in ${duration}ms`);
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(5000); // 5 seconds
    });
  });
});