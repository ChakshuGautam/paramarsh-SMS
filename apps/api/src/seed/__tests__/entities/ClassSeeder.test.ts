/**
 * ClassSeeder Tests
 * Following TDD methodology for Seed Data Manager v3.0
 */
import { ClassSeeder } from '../../entities/ClassSeeder';
import { createTestSeedContext } from '../test-helpers';
import { SeedContext } from '../../core/interfaces';
import { cleanupBranchData, generateTestBranchId } from '../helpers/cleanup';
import { getTestPrisma } from '../setup';
describe('ClassSeeder', () => {
  let classSeeder: ClassSeeder;
  let context: SeedContext;
  let testBranchId: string;
  let prisma: ReturnType<typeof getTestPrisma>;
  beforeEach(async () => {
    prisma = getTestPrisma();
    classSeeder = new ClassSeeder();
    testBranchId = generateTestBranchId('test-class');
    context = createTestSeedContext(testBranchId);
  });
  afterEach(async () => {
    // Clean up test data after each test
    await cleanupBranchData(prisma, testBranchId);
  });
  describe('Basic Properties', () => {
    test('should have correct entity name', () => {
      expect(classSeeder.entityName).toBe('classes');
    });
    test('should have appropriate dependencies', () => {
      expect(classSeeder.dependencies).toEqual(['academicYears', 'subjects']);
      expect(classSeeder.getDependencies()).toEqual(['academicYears', 'subjects']);
    });
    test('should have appropriate batch size', () => {
      expect(classSeeder.batchSize).toBeLessThanOrEqual(100);
      expect(classSeeder.batchSize).toBeGreaterThan(0);
    });
  });
  describe('Record Count Estimation', () => {
    test('should estimate appropriate class count for primary branch', () => {
      const count = classSeeder.estimateRecordCount('sps-primary'); // Primary grades only
      expect(count).toBeGreaterThan(3);
      expect(count).toBeLessThan(12);
    });
    test('should estimate more classes for full K-12 branch', () => {
      const count = classSeeder.estimateRecordCount('dps-main'); // Full K-12
      expect(count).toBeGreaterThan(10);
      expect(count).toBeLessThan(20);
    });
    test('should handle unknown branch gracefully', () => {
      const count = classSeeder.estimateRecordCount('unknown-branch');
      expect(count).toBeGreaterThan(5);
      expect(count).toBeLessThan(15);
    });
  });
  describe('Class Data Generation', () => {
    test('should generate classes with Indian grade system', async () => {
      const result = await classSeeder.seed(context);
      expect(result.success).toBe(true);
      expect(result.metrics.successCount).toBeGreaterThan(0);
      expect(result.metrics.errorCount).toBe(0);
      expect(result.data!.length).toBeGreaterThan(0);
      // Check first class
      const classObj = result.data![0];
      expect(classObj.branchId).toBe(context.branchId);
      expect(classObj.name).toBeTruthy();
      expect(classObj.gradeLevel).toBeGreaterThanOrEqual(0);
      expect(classObj.gradeLevel).toBeLessThanOrEqual(12);
    });
    test('should include standard Indian grade levels', async () => {
      const result = await classSeeder.seed(context);
      expect(result.success).toBe(true);
      const classNames = result.data!.map((c: any) => c.name);
      // Should have some standard Indian grade names
      const hasIndianGrades = classNames.some(name => 
        ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'].includes(name)
      );
      expect(hasIndianGrades).toBe(true);
    });
    test('should generate unique class names within branch', async () => {
      const result = await classSeeder.seed(context);
      expect(result.success).toBe(true);
      const classNames = result.data!.map((c: any) => c.name);
      const uniqueNames = new Set(classNames);
      expect(uniqueNames.size).toBe(classNames.length);
    });
    test('should set appropriate grade levels', async () => {
      const result = await classSeeder.seed(context);
      expect(result.success).toBe(true);
      // All classes should have valid grade levels
      result.data!.forEach((classObj: any) => {
        expect(classObj.gradeLevel).toBeGreaterThanOrEqual(0); // Nursery = 0
        expect(classObj.gradeLevel).toBeLessThanOrEqual(12); // Class 12 = 12
      });
    });
    test('should create sections for each class', async () => {
      const result = await classSeeder.seed(context);
      expect(result.success).toBe(true);
      // Verify sections were created
      const sections = await context.prisma.section.findMany({
        where: { branchId: testBranchId }
      });
      expect(sections.length).toBeGreaterThan(0);
      // Each class should have at least one section
      const classIds = result.data!.map((c: any) => c.id);
      const sectionsPerClass = new Map();
      sections.forEach(section => {
        if (!sectionsPerClass.has(section.classId)) {
          sectionsPerClass.set(section.classId, 0);
        }
        sectionsPerClass.set(section.classId, sectionsPerClass.get(section.classId) + 1);
      });
      classIds.forEach(classId => {
        expect(sectionsPerClass.get(classId)).toBeGreaterThan(0);
      });
    });
  });
  describe('Database Operations', () => {
    test('should successfully create classes and sections in database', async () => {
      const result = await classSeeder.seed(context);
      expect(result.success).toBe(true);
      // Verify classes in database
      const dbClasses = await context.prisma.class.findMany({
        where: { branchId: testBranchId }
      });
      expect(dbClasses.length).toBeGreaterThan(0);
      // The successCount includes both classes and sections
      // So we check that the total matches
      const dbSectionsCount = await context.prisma.section.count({
        where: { branchId: testBranchId }
      });
      expect(dbClasses.length + dbSectionsCount).toBe(result.metrics.successCount);
      // Verify sections in database
      const dbSections = await context.prisma.section.findMany({
        where: { branchId: testBranchId }
      });
      expect(dbSections.length).toBeGreaterThan(0);
    });
    test('should handle duplicate class creation gracefully', async () => {
      // Create classes first time
      const result1 = await classSeeder.seed(context);
      expect(result1.success).toBe(true);
      // Try to create again - should handle gracefully
      const result2 = await classSeeder.seed(context);
      expect(result2.success).toBe(true);
      // Should not have duplicates
      const classCount = await context.prisma.class.count({
        where: { branchId: testBranchId }
      });
      const sectionCount = await context.prisma.section.count({
        where: { branchId: testBranchId }
      });
      // The successCount includes both classes and sections
      expect(classCount + sectionCount).toBe(result1.metrics.successCount);
    });
    test('should store created entities in context', async () => {
      const result = await classSeeder.seed(context);
      expect(result.success).toBe(true);
      expect(context.createdEntities.has('classes')).toBe(true);
      const createdClasses = context.createdEntities.get('classes');
      expect(createdClasses!.length).toBeGreaterThan(0);
      // Also check sections are stored
      expect(context.createdEntities.has('sections')).toBe(true);
      const createdSections = context.createdEntities.get('sections');
      expect(createdSections!.length).toBeGreaterThan(0);
      // Combined should match metrics
      expect(createdClasses!.length + createdSections!.length).toBe(result.metrics.successCount);
    });
  });
  describe('Validation', () => {
    test('should validate successfully when classes exist', async () => {
      // Create classes first
      await classSeeder.seed(context);
      // Validate
      const isValid = await classSeeder.validate(context);
      expect(isValid).toBe(true);
    });
    test('should fail validation when no classes exist', async () => {
      const isValid = await classSeeder.validate(context);
      expect(isValid).toBe(false);
    });
    test('should validate correct record count', async () => {
      const result = await classSeeder.seed(context);
      const recordCount = await classSeeder['getRecordCount'](context);
      // getRecordCount only counts classes, not sections
      const classCount = await context.prisma.class.count({
        where: { branchId: testBranchId }
      });
      expect(recordCount).toBe(classCount);
    });
  });
  describe('Multi-Branch Support', () => {
    test('should generate different class structures for different branches', () => {
      const branches = ['dps-main', 'kvs-airport', 'sps-senior'];
      const branchClassData = {};
      branches.forEach(branchId => {
        const classes = classSeeder['generateClasses'](branchId);
        branchClassData[branchId] = classes.map((c: any) => c.name);
      });
      // Primary branch should have fewer classes than full K-12
      expect(branchClassData['kvs-airport'].length).toBeLessThan(branchClassData['dps-main'].length);
      // Senior branch should have only high school classes
      expect(branchClassData['sps-senior'].every((name: string) => 
        ['Class 11', 'Class 12'].includes(name)
      )).toBe(true);
    });
    test('should generate branch-specific sections based on configuration', () => {
      // DPS main should have more sections per class
      const dpsClasses = classSeeder['generateClasses']('dps-main');
      const dpsClass = dpsClasses[0];
      const dpsSections = classSeeder['generateSections'](dpsClass, 'dps-main');
      // KVS airport should have fewer sections per class
      const kvsClasses = classSeeder['generateClasses']('kvs-airport');
      const kvsClass = kvsClasses[0];
      const kvsSections = classSeeder['generateSections'](kvsClass, 'kvs-airport');
      expect(dpsSections.length).toBeGreaterThanOrEqual(kvsSections.length);
    });
  });
  describe('Indian Education System Compliance', () => {
    test('should include pre-primary classes for appropriate branches', () => {
      const classes = classSeeder['generateClasses']('dps-main');
      const classNames = classes.map((c: any) => c.name);
      expect(classNames).toContain('Nursery');
      expect(classNames).toContain('LKG');
      expect(classNames).toContain('UKG');
    });
    test('should include primary classes', () => {
      const classes = classSeeder['generateClasses']('kvs-central');
      const classNames = classes.map((c: any) => c.name);
      expect(classNames).toContain('Class 1');
      expect(classNames).toContain('Class 2');
      expect(classNames).toContain('Class 3');
      expect(classNames).toContain('Class 4');
      expect(classNames).toContain('Class 5');
    });
    test('should include secondary classes for full schools', () => {
      const classes = classSeeder['generateClasses']('dps-main');
      const classNames = classes.map((c: any) => c.name);
      expect(classNames).toContain('Class 9');
      expect(classNames).toContain('Class 10');
      expect(classNames).toContain('Class 11');
      expect(classNames).toContain('Class 12');
    });
    test('should assign correct grade levels', () => {
      const classes = classSeeder['generateClasses']('dps-main');
      const nursery = classes.find((c: any) => c.name === 'Nursery');
      const class1 = classes.find((c: any) => c.name === 'Class 1');
      const class12 = classes.find((c: any) => c.name === 'Class 12');
      expect(nursery?.gradeLevel).toBe(0);
      expect(class1?.gradeLevel).toBe(1);
      expect(class12?.gradeLevel).toBe(12);
    });
  });
  describe('Section Generation', () => {
    test('should create appropriate number of sections per class', () => {
      const classes = classSeeder['generateClasses']('dps-main');
      const firstClass = classes[0];
      const sections = classSeeder['generateSections'](firstClass, 'dps-main');
      expect(sections.length).toBeGreaterThan(0);
      expect(sections.length).toBeLessThanOrEqual(4); // Max 4 sections per config
    });
    test('should use standard Indian section naming', () => {
      const classes = classSeeder['generateClasses']('kvs-central');
      const firstClass = classes[0];
      const sections = classSeeder['generateSections'](firstClass, 'kvs-central');
      const sectionNames = sections.map((s: any) => s.name);
      expect(sectionNames.every((name: string) => ['A', 'B', 'C', 'D'].includes(name))).toBe(true);
    });
    test('should set appropriate capacity for sections', () => {
      const classes = classSeeder['generateClasses']('kvs-central');
      const firstClass = classes[0];
      const sections = classSeeder['generateSections'](firstClass, 'kvs-central');
      sections.forEach((section: any) => {
        expect(section.capacity).toBeGreaterThan(20);
        expect(section.capacity).toBeLessThanOrEqual(50);
      });
    });
  });
  describe('Performance', () => {
    test('should seed classes within reasonable time', async () => {
      const startTime = Date.now();
      const result = await classSeeder.seed(context);
      const duration = Date.now() - startTime;
      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
    });
    test('should have appropriate memory usage', async () => {
      const result = await classSeeder.seed(context);
      expect(result.success).toBe(true);
      expect(result.metrics.memoryUsage).toBeDefined();
      expect(result.metrics.memoryUsage!.heapUsed).toBeGreaterThan(0);
    });
  });
  describe('Edge Cases', () => {
    test('should handle unknown branch gracefully', () => {
      const classes = classSeeder['generateClasses']('unknown-school-xyz');
      expect(classes.length).toBeGreaterThan(0);
      expect(classes.every((c: any) => c.name && typeof c.gradeLevel === 'number')).toBe(true);
    });
    test('should cleanup properly when requested', async () => {
      await classSeeder.seed(context);
      // Cleanup should not fail
      await expect(classSeeder.cleanup(context)).resolves.not.toThrow();
    });
  });
});