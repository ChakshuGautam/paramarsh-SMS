/**
 * ClassSubjectTeacherSeeder Tests - Direct Seeding
 * Tests class-subject-teacher assignments
 */

import { ClassSubjectTeacherSeeder } from '../../entities/ClassSubjectTeacherSeeder';
import { TenantSeeder } from '../../entities/TenantSeeder';
import { SubjectSeeder } from '../../entities/SubjectSeeder';
import { ClassSeeder } from '../../entities/ClassSeeder';
import { TeacherSeeder } from '../../entities/TeacherSeeder';
import { SeedContext } from '../../core/interfaces';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run

describe('ClassSubjectTeacherSeeder - Direct Tests', () => {
  let seeder: ClassSubjectTeacherSeeder;
  let prisma: ReturnType<typeof getTestPrisma>;
  const testBranchId = 'test-direct-branch';

  beforeAll(async () => {
    prisma = getTestPrisma();
  });

  beforeEach(() => {
    seeder = new ClassSubjectTeacherSeeder();
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.classSubjectTeacher.deleteMany({ where: { branchId: testBranchId } });
    await prisma.section.deleteMany({ where: { branchId: testBranchId } });
    await prisma.class.deleteMany({ where: { branchId: testBranchId } });
    await prisma.teacher.deleteMany({ where: { branchId: testBranchId } });
    await prisma.subject.deleteMany({ where: { branchId: testBranchId } });
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
      console.error('Tenant seeding failed:', tenantResult.errors);
      throw new Error(`Failed to create tenant: ${tenantResult.errors?.join(', ')}`);
    }

    // Create subjects
    const subjectSeeder = new SubjectSeeder();
    const subjectResult = await subjectSeeder.seed(context);
    if (!subjectResult.success) {
      throw new Error('Failed to create subjects');
    }

    // Create classes and sections
    const classSeeder = new ClassSeeder();
    const classResult = await classSeeder.seed(context);
    if (!classResult.success) {
      throw new Error('Failed to create classes');
    }

    // Create teachers
    const teacherSeeder = new TeacherSeeder();
    const teacherResult = await teacherSeeder.seed(context);
    if (!teacherResult.success) {
      throw new Error('Failed to create teachers');
    }
    // Manually add teachers to context since TeacherSeeder doesn't do it
    context.createdEntities.set('teachers', teacherResult.data);

    return context;
  }

  describe('Basic Functionality', () => {
    it('should create class-subject-teacher assignments', async () => {
      const context = await setupTestData();
      
      const result = await seeder.seed(context);
      
      // Debug log any errors
      if (result.errors) {
        console.log('Seeding errors:', result.errors);
      }
      
      expect(result.success).toBe(true);
      expect(result.metrics.totalRecords).toBeGreaterThan(0);
      
      // Verify assignments were created
      const assignmentCount = await prisma.classSubjectTeacher.count({
        where: { branchId: testBranchId }
      });
      
      console.log(`Created ${assignmentCount} class-subject-teacher assignments`);
      expect(assignmentCount).toBeGreaterThan(50); // At least 50 assignments
    });

    it('should ensure each class has subject coverage', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get all classes
      const classes = await prisma.class.findMany({
        where: { branchId: testBranchId }
      });
      
      // Check each class has subject assignments
      for (const classEntity of classes) {
        const classAssignments = await prisma.classSubjectTeacher.count({
          where: { 
            branchId: testBranchId,
            classId: classEntity.id
          }
        });
        
        // Each class should have at least core subjects assigned
        expect(classAssignments).toBeGreaterThanOrEqual(5);
      }
    });

    it('should balance teacher workload', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Check teacher assignment distribution
      const teacherLoads = await prisma.classSubjectTeacher.groupBy({
        by: ['teacherId'],
        where: { branchId: testBranchId },
        _count: true
      });
      
      teacherLoads.forEach(load => {
        // No teacher should be overloaded (max 8 class-subject assignments)
        expect(load._count).toBeLessThanOrEqual(8);
        // Each teacher should have at least one assignment
        expect(load._count).toBeGreaterThanOrEqual(1);
      });
    });

    it('should assign homeroom teachers to sections', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Check that sections have homeroom teachers assigned
      const sectionsWithHomeroomTeachers = await prisma.section.findMany({
        where: { 
          branchId: testBranchId,
          homeroomTeacherId: { not: null }
        }
      });
      
      // Most sections should have homeroom teachers
      expect(sectionsWithHomeroomTeachers.length).toBeGreaterThan(10);
    });

    it('should create unique assignments for each class-subject pair', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Check that assignments are unique
      const assignments = await prisma.classSubjectTeacher.findMany({
        where: { branchId: testBranchId }
      });
      
      // Create a map of unique combinations
      const combinationMap = new Map<string, any[]>();
      assignments.forEach(assignment => {
        const key = `${assignment.classId}-${assignment.subjectId}`;
        if (!combinationMap.has(key)) {
          combinationMap.set(key, []);
        }
        combinationMap.get(key)!.push(assignment);
      });
      
      // Each combination should have only one assignment (or multiple if different teachers)
      for (const [key, assigns] of combinationMap.entries()) {
        const teacherIds = new Set(assigns.map(a => a.teacherId));
        // Should have unique teachers for each class-subject combination
        expect(teacherIds.size).toBe(assigns.length);
      }
    });
  });

  describe('Idempotency', () => {
    it('should not create duplicate assignments on multiple runs', async () => {
      const context = await setupTestData();
      
      // First run
      const result1 = await seeder.seed(context);
      const count1 = await prisma.classSubjectTeacher.count({
        where: { branchId: testBranchId }
      });
      
      // Second run
      const result2 = await seeder.seed(context);
      const count2 = await prisma.classSubjectTeacher.count({
        where: { branchId: testBranchId }
      });
      
      // Should not create duplicates
      expect(count2).toBe(count1);
      expect(result2.metrics.totalRecords).toBe(0); // No new records created
    });
  });

  describe('Performance', () => {
    it('should efficiently create assignments', async () => {
      const context = await setupTestData();
      
      const startTime = Date.now();
      const result = await seeder.seed(context);
      const duration = Date.now() - startTime;
      
      console.log(`Created ${result.metrics.successCount} assignments in ${duration}ms`);
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(5000); // 5 seconds
    });
  });
});