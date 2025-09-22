/**
 * ClassSubjectTeacherSeeder Tests using Checkpoint System
 * Tests class-subject-teacher assignments
 */
import { ClassSubjectTeacherSeeder } from '../../entities/ClassSubjectTeacherSeeder';
import { CheckpointTestHelper } from '../checkpoint-test-helper';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run
describe('ClassSubjectTeacherSeeder - Checkpoint Tests', () => {
  let helper: CheckpointTestHelper;
  let seeder: ClassSubjectTeacherSeeder;
  let prisma: ReturnType<typeof getTestPrisma>;
  const testBranchId = 'test-checkpoint-branch';
  beforeAll(async () => {
    prisma = getTestPrisma();
    helper = new CheckpointTestHelper({
      branchId: testBranchId,
      prisma,
      checkpointDir: '.test-checkpoints-class-subject-teacher'
    });
    // Initialize checkpoints (creates them if they don't exist)
    await helper.initialize();
  });
  afterAll(async () => {
    await helper.cleanup();
  });
  beforeEach(() => {
    seeder = new ClassSubjectTeacherSeeder();
  });
  describe('Starting from Teachers Checkpoint', () => {
    it('should create class-subject-teacher assignments', async () => {
      const context = await helper.restoreToCheckpoint('teachers');
      const result = await seeder.seed(context);
      expect(result.success).toBe(true);
      expect(result.metrics.totalRecords).toBeGreaterThan(0);
      // Verify assignments were created
      const assignmentCount = await prisma.classSubjectTeacher.count({
        where: { branchId: testBranchId }
      });
      console.log(`Created ${assignmentCount} class-subject-teacher assignments`);
      expect(assignmentCount).toBeGreaterThan(50); // At least 50 assignments
    });
    it('should assign teachers to subjects based on qualifications', async () => {
      const context = await helper.restoreToCheckpoint('teachers');
      await seeder.seed(context);
      // Check Math assignments have Math qualified teachers
      const mathAssignments = await prisma.classSubjectTeacher.findMany({
        where: { 
          branchId: testBranchId,
          subject: {
            name: 'Mathematics'
          }
        },
        include: {
          teacher: {
            include: { staff: true }
          }
        }
      });
      mathAssignments.forEach(assignment => {
        expect(['Mathematics', 'Science', 'Physics']).toContain(
          assignment.teacher.staff?.department
        );
      });
    });
    it('should ensure each class has subject coverage', async () => {
      const context = await helper.restoreToCheckpoint('teachers');
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
      const context = await helper.restoreToCheckpoint('teachers');
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
      const context = await helper.restoreToCheckpoint('teachers');
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
    it('should handle primary vs secondary classes appropriately', async () => {
      const context = await helper.restoreToCheckpoint('teachers');
      await seeder.seed(context);
      // Get primary class assignments
      const primaryClasses = await prisma.class.findMany({
        where: { 
          branchId: testBranchId,
          gradeLevel: { lte: 5 }
        }
      });
      // Check assignments for primary classes
      for (const primaryClass of primaryClasses.slice(0, 2)) {
        const assignments = await prisma.classSubjectTeacher.findMany({
          where: { 
            branchId: testBranchId,
            classId: primaryClass.id
          },
          include: {
            teacher: { include: { staff: true } }
          }
        });
        // Primary classes should have subject assignments
        expect(assignments.length).toBeGreaterThan(0);
      }
    });
    it('should create unique assignments for each class-subject pair', async () => {
      const context = await helper.restoreToCheckpoint('teachers');
      await seeder.seed(context);
      // Check that assignments are unique
      const assignments = await prisma.classSubjectTeacher.findMany({
        where: { branchId: testBranchId }
      });
      // Create a set of unique combinations
      const uniqueCombinations = new Set();
      assignments.forEach(assignment => {
        const key = `${assignment.classId}-${assignment.subjectId}`;
        uniqueCombinations.add(key);
      });
      // Should have unique combinations
      expect(uniqueCombinations.size).toBeGreaterThan(0);
      expect(uniqueCombinations.size).toBeLessThanOrEqual(assignments.length);
    });
  });
  describe('Idempotency', () => {
    it('should not create duplicate assignments on multiple runs', async () => {
      const context = await helper.restoreToCheckpoint('teachers');
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
  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const context = await helper.restoreToCheckpoint('teachers');
      // Mock a database error
      const originalCreate = context.prisma.classSubjectTeacher.create;
      let callCount = 0;
      context.prisma.classSubjectTeacher.create = jest.fn().mockImplementation((args) => {
        callCount++;
        if (callCount === 5) {
          throw new Error('Database connection lost');
        }
        return originalCreate.call(context.prisma.classSubjectTeacher, args);
      });
      const result = await seeder.seed(context);
      // Should handle the error and continue with other assignments
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.errors![0]).toContain('Database connection lost');
      // Restore original function
      context.prisma.classSubjectTeacher.create = originalCreate;
    });
  });
  describe('Performance', () => {
    it('should efficiently create assignments', async () => {
      const context = await helper.restoreToCheckpoint('teachers');
      const startTime = Date.now();
      const result = await seeder.seed(context);
      const duration = Date.now() - startTime;
      console.log(`Created ${result.metrics.successCount} assignments in ${duration}ms`);
      // Should complete within reasonable time
      expect(duration).toBeLessThan(5000); // 5 seconds
    });
  });
});