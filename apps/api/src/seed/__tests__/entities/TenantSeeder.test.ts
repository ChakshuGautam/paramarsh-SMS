/**
 * TenantSeeder Tests
 * Following TDD methodology for Seed Data Manager v3.0
 */
import { TenantSeeder } from '../../entities/TenantSeeder';
import { createTestSeedContext } from '../test-helpers';
import { SeedContext } from '../../core/interfaces';
describe('TenantSeeder', () => {
  let tenantSeeder: TenantSeeder;
  let context: SeedContext;
  beforeAll(() => {
    context = createTestSeedContext();
  });
  beforeEach(() => {
    tenantSeeder = new TenantSeeder();
    context.createdEntities.clear();
  });
  afterEach(async () => {
    // Clean up test data
    await context.prisma.tenant.deleteMany({
      where: { branchId: context.branchId }
    });
  });
  describe('Basic Properties', () => {
    test('should have correct entity name', () => {
      expect(tenantSeeder.entityName).toBe('tenants');
    });
    test('should have no dependencies', () => {
      expect(tenantSeeder.dependencies).toEqual([]);
      expect(tenantSeeder.getDependencies()).toEqual([]);
    });
    test('should have appropriate batch size', () => {
      expect(tenantSeeder.batchSize).toBeLessThanOrEqual(100);
      expect(tenantSeeder.batchSize).toBeGreaterThan(0);
    });
  });
  describe('Record Count Estimation', () => {
    test('should estimate 1 tenant per branch', () => {
      const count = tenantSeeder.estimateRecordCount('dps-main');
      expect(count).toBe(1);
    });
    test('should estimate same count for any branch', () => {
      const branches = ['dps-main', 'kvs-central', 'sps-primary', 'ris-main'];
      branches.forEach(branchId => {
        expect(tenantSeeder.estimateRecordCount(branchId)).toBe(1);
      });
    });
  });
  describe('Tenant Data Generation', () => {
    test('should generate tenant with correct branchId structure', async () => {
      const result = await tenantSeeder.seed(context);
      expect(result.success).toBe(true);
      expect(result.metrics.successCount).toBe(1);
      expect(result.metrics.errorCount).toBe(0);
      expect(result.data).toHaveLength(1);
      const tenant = result.data![0];
      expect(tenant.id).toBe(context.branchId);
      expect(tenant.branchId).toBe(context.branchId);
      expect(tenant.name).toContain('School'); // Generic test for fallback case
      expect(tenant.subdomain).toBe(context.branchId);
    });
    test('should create unique tenant IDs for different branches', () => {
      const branches = ['dps-main', 'dps-north', 'kvs-central'];
      const tenantIds = new Set();
      branches.forEach(branchId => {
        const tenant = tenantSeeder['generateTenantData'](branchId);
        expect(tenantIds.has(tenant.id)).toBe(false);
        tenantIds.add(tenant.id);
        expect(tenant.id).toBe(branchId);
      });
    });
    test('should generate appropriate school names based on branch ID', () => {
      const testCases = [
        { branchId: 'dps-main', expectedName: 'Delhi Public School - Main Campus' },
        { branchId: 'kvs-central', expectedName: 'Kendriya Vidyalaya - Central' },
        { branchId: 'sps-primary', expectedName: 'St. Paul\'s School - Primary Wing' },
        { branchId: 'ris-main', expectedName: 'Ryan International School - Main Branch' }
      ];
      testCases.forEach(({ branchId, expectedName }) => {
        const tenant = tenantSeeder['generateTenantData'](branchId);
        expect(tenant.name).toBe(expectedName);
      });
    });
  });
  describe('Database Operations', () => {
    test('should successfully create tenant in database', async () => {
      const result = await tenantSeeder.seed(context);
      expect(result.success).toBe(true);
      // Verify in database
      const dbTenant = await context.prisma.tenant.findUnique({
        where: { id: context.branchId }
      });
      expect(dbTenant).not.toBeNull();
      expect(dbTenant!.id).toBe(context.branchId);
      expect(dbTenant!.branchId).toBe(context.branchId);
    });
    test('should handle duplicate tenant creation gracefully', async () => {
      // Create tenant first time
      const result1 = await tenantSeeder.seed(context);
      expect(result1.success).toBe(true);
      // Try to create again - should handle gracefully
      const result2 = await tenantSeeder.seed(context);
      expect(result2.success).toBe(true);
      // Should still have only one tenant
      const tenantCount = await context.prisma.tenant.count({
        where: { branchId: context.branchId }
      });
      expect(tenantCount).toBe(1);
    });
    test('should store created entities in context', async () => {
      const result = await tenantSeeder.seed(context);
      expect(result.success).toBe(true);
      expect(context.createdEntities.has('tenants')).toBe(true);
      const createdTenants = context.createdEntities.get('tenants');
      expect(createdTenants).toHaveLength(1);
      expect(createdTenants![0].id).toBe(context.branchId);
    });
  });
  describe('Validation', () => {
    test('should validate successfully when tenant exists', async () => {
      // Create tenant first
      await tenantSeeder.seed(context);
      // Validate
      const isValid = await tenantSeeder.validate(context);
      expect(isValid).toBe(true);
    });
    test('should fail validation when no tenant exists', async () => {
      const isValid = await tenantSeeder.validate(context);
      expect(isValid).toBe(false);
    });
    test('should validate correct record count', async () => {
      await tenantSeeder.seed(context);
      const recordCount = await tenantSeeder['getRecordCount'](context);
      expect(recordCount).toBe(1);
    });
  });
  describe('Edge Cases', () => {
    test('should handle unknown branch ID gracefully', () => {
      const unknownBranchId = 'unknown-branch';
      const tenant = tenantSeeder['generateTenantData'](unknownBranchId);
      expect(tenant.id).toBe(unknownBranchId);
      expect(tenant.branchId).toBe(unknownBranchId);
      expect(tenant.name).toContain('School'); // Should have fallback name
      expect(tenant.subdomain).toBe(unknownBranchId);
    });
    test('should cleanup properly when requested', async () => {
      await tenantSeeder.seed(context);
      // Cleanup should not fail
      await expect(tenantSeeder.cleanup(context)).resolves.not.toThrow();
    });
  });
  describe('Performance', () => {
    test('should seed tenant within reasonable time', async () => {
      const startTime = Date.now();
      const result = await tenantSeeder.seed(context);
      const duration = Date.now() - startTime;
      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
    test('should have appropriate memory usage', async () => {
      const result = await tenantSeeder.seed(context);
      expect(result.success).toBe(true);
      expect(result.metrics.memoryUsage).toBeDefined();
      expect(result.metrics.memoryUsage!.heapUsed).toBeGreaterThan(0);
    });
  });
  describe('Multi-Branch Support', () => {
    test('should support all defined branch configurations', () => {
      const branchIds = [
        'dps-main', 'dps-north', 'dps-south', 'dps-east', 'dps-west',
        'kvs-central', 'kvs-cantonment', 'kvs-airport',
        'sps-primary', 'sps-secondary', 'sps-senior',
        'ris-main', 'ris-extension'
      ];
      branchIds.forEach(branchId => {
        const tenant = tenantSeeder['generateTenantData'](branchId);
        expect(tenant.id).toBe(branchId);
        expect(tenant.branchId).toBe(branchId);
        expect(tenant.name).toBeTruthy();
        expect(tenant.subdomain).toBe(branchId);
      });
    });
    test('should generate different names for different school types', () => {
      const schoolTypes = {
        'dps-main': 'Delhi Public School',
        'kvs-central': 'Kendriya Vidyalaya',
        'sps-primary': 'St. Paul\'s School',
        'ris-main': 'Ryan International School'
      };
      Object.entries(schoolTypes).forEach(([branchId, expectedSchoolType]) => {
        const tenant = tenantSeeder['generateTenantData'](branchId);
        expect(tenant.name).toContain(expectedSchoolType);
      });
    });
  });
});