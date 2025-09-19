/**
 * FeeComponentSeeder Tests - Direct Seeding
 * Tests fee component generation for fee structures
 */

import { FeeComponentSeeder } from '../../entities/FeeComponentSeeder';
import { TenantSeeder } from '../../entities/TenantSeeder';
import { ClassSeeder } from '../../entities/ClassSeeder';
import { FeeStructureSeeder } from '../../entities/FeeStructureSeeder';
import { SeedContext } from '../../core/interfaces';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run

describe('FeeComponentSeeder - Direct Tests', () => {
  let seeder: FeeComponentSeeder;
  let prisma: ReturnType<typeof getTestPrisma>;
  const testBranchId = 'test-direct-branch';

  beforeAll(async () => {
    prisma = getTestPrisma();
  });

  beforeEach(() => {
    seeder = new FeeComponentSeeder();
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.feeComponent.deleteMany({});
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
    it('should create fee components', async () => {
      const context = await setupTestData();
      
      const result = await seeder.seed(context);
      
      // Debug log any errors
      if (result.errors) {
        console.log('Seeding errors:', result.errors);
      }
      
      expect(result.success).toBe(true);
      expect(result.metrics.totalRecords).toBeGreaterThan(0);
      
      // Verify components were created
      const componentCount = await prisma.feeComponent.count();
      
      console.log(`Created ${componentCount} fee components`);
      expect(componentCount).toBeGreaterThan(0);
    });

    it('should create multiple components per structure', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get a fee structure
      const structure = await prisma.feeStructure.findFirst({
        where: { branchId: testBranchId }
      });
      
      if (structure) {
        // Get components for this structure
        const components = await prisma.feeComponent.findMany({
          where: { feeStructureId: structure.id }
        });
        
        // Should have multiple components per structure (tuition, transport, etc.)
        expect(components.length).toBeGreaterThanOrEqual(5);
      }
    });

    it('should assign appropriate component types', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get all components
      const components = await prisma.feeComponent.findMany({
        where: { branchId: testBranchId }
      });
      
      // Check for common fee types
      const types = components.map(c => c.name);
      expect(types).toEqual(expect.arrayContaining([
        expect.stringContaining('Tuition'),
        expect.stringContaining('Transport'),
        expect.stringContaining('Books')
      ]));
    });

    it('should assign realistic amounts based on grade', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get components
      const components = await prisma.feeComponent.findMany({
        where: { 
          branchId: testBranchId,
          name: { contains: 'Tuition' }
        }
      });
      
      components.forEach(component => {
        // Tuition should be between 1000 and 10000 per month
        expect(component.amount).toBeGreaterThanOrEqual(1000);
        expect(component.amount).toBeLessThanOrEqual(10000);
      });
    });

    it('should set component types', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get components
      const components = await prisma.feeComponent.findMany({
        where: { branchId: testBranchId }
      });
      
      components.forEach(component => {
        expect(component.type).toBeDefined();
        expect(['mandatory', 'optional']).toContain(component.type);
      });
    });
  });

  describe('Idempotency', () => {
    it('should not create duplicate components on multiple runs', async () => {
      const context = await setupTestData();
      
      // First run
      const result1 = await seeder.seed(context);
      const count1 = await prisma.feeComponent.count();
      
      // Second run
      const result2 = await seeder.seed(context);
      const count2 = await prisma.feeComponent.count();
      
      // Should not create duplicates
      expect(count2).toBe(count1);
      expect(result2.metrics.totalRecords).toBe(0); // No new records created
    });
  });

  describe('Performance', () => {
    it('should efficiently create fee components', async () => {
      const context = await setupTestData();
      
      const startTime = Date.now();
      const result = await seeder.seed(context);
      const duration = Date.now() - startTime;
      
      console.log(`Created ${result.metrics.successCount} components in ${duration}ms`);
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(10000); // 10 seconds
    });
  });
});