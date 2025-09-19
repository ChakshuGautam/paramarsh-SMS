/**
 * EnrollmentSeeder Tests using Checkpoint System
 * Tests enrollment generation linking students to sections
 */

import { EnrollmentSeeder } from '../../entities/EnrollmentSeeder';
import { CheckpointTestHelper } from '../checkpoint-test-helper';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run

describe('EnrollmentSeeder - Checkpoint Tests', () => {
  let helper: CheckpointTestHelper;
  let seeder: EnrollmentSeeder;
  let prisma: ReturnType<typeof getTestPrisma>;
  const testBranchId = 'test-checkpoint-branch';

  beforeAll(async () => {
    prisma = getTestPrisma();
    helper = new CheckpointTestHelper({
      branchId: testBranchId,
      prisma,
      checkpointDir: '.test-checkpoints-enrollment'
    });
    
    // Initialize checkpoints (creates them if they don't exist)
    await helper.initialize();
  });

  afterAll(async () => {
    await helper.cleanup();
  });

  beforeEach(() => {
    seeder = new EnrollmentSeeder();
  });

  describe('Starting from Students Checkpoint', () => {
    it('should create enrollments for all students', async () => {
      // Restore to the point where students exist
      const context = await helper.restoreToCheckpoint('students');
      
      // Verify we have students
      const studentCount = await prisma.student.count({
        where: { branchId: testBranchId }
      });
      
      console.log(`Starting with ${studentCount} students`);
      expect(studentCount).toBeGreaterThan(0);
      
      // Now run EnrollmentSeeder
      const result = await seeder.seed(context);
      
      expect(result.success).toBe(true);
      expect(result.metrics.totalRecords).toBe(studentCount);
      
      // Verify enrollments were created
      const enrollmentCount = await prisma.enrollment.count({
        where: { branchId: testBranchId }
      });
      
      console.log(`Created ${enrollmentCount} enrollments`);
      expect(enrollmentCount).toBe(studentCount);
    });

    it('should link enrollments to correct sections', async () => {
      const context = await helper.restoreToCheckpoint('students');
      
      await seeder.seed(context);
      
      // Get some students and their enrollments
      const students = await prisma.student.findMany({
        where: { branchId: testBranchId },
        take: 10
      });
      
      for (const student of students) {
        const enrollment = await prisma.enrollment.findFirst({
          where: {
            studentId: student.id,
            sectionId: student.sectionId
          }
        });
        
        expect(enrollment).toBeDefined();
        expect(enrollment!.sectionId).toBe(student.sectionId);
      }
    });

    it('should set enrollment dates based on academic year', async () => {
      const context = await helper.restoreToCheckpoint('students');
      
      await seeder.seed(context);
      
      const academicYear = await prisma.academicYear.findFirst({
        where: { branchId: testBranchId },
        orderBy: { startDate: 'desc' }
      });
      
      const enrollments = await prisma.enrollment.findMany({
        where: { branchId: testBranchId },
        take: 20
      });
      
      for (const enrollment of enrollments) {
        expect(enrollment.startDate).toBe(academicYear!.startDate.toISOString());
        expect(enrollment.endDate).toBe(academicYear!.endDate.toISOString());
      }
    });

    it('should set all enrollments to active status', async () => {
      const context = await helper.restoreToCheckpoint('students');
      
      await seeder.seed(context);
      
      const enrollments = await prisma.enrollment.findMany({
        where: { branchId: testBranchId }
      });
      
      enrollments.forEach(enrollment => {
        expect(enrollment.status).toBe('active');
      });
    });
  });

  describe('Idempotency', () => {
    it('should not create duplicate enrollments on multiple runs', async () => {
      const context = await helper.restoreToCheckpoint('students');
      
      // First run
      const result1 = await seeder.seed(context);
      const count1 = await prisma.enrollment.count({
        where: { branchId: testBranchId }
      });
      
      // Second run
      const result2 = await seeder.seed(context);
      const count2 = await prisma.enrollment.count({
        where: { branchId: testBranchId }
      });
      
      // Should not create duplicates
      expect(count2).toBe(count1);
      expect(result2.metrics.totalRecords).toBe(0); // No new records created
    });
  });

  describe('Error Handling', () => {
    it('should handle missing students dependency', async () => {
      // Start from a state with no students
      const context = await helper.restoreToCheckpoint('academicYears');
      
      const result = await seeder.seed(context);
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Missing dependency: students');
    });

    it('should handle missing academic years dependency', async () => {
      // Start from a state with no academic years
      const context = await helper.restoreToCheckpoint('tenants');
      
      const result = await seeder.seed(context);
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Missing dependency: academicYears');
    });
  });

  describe('Relationships', () => {
    it('should ensure each student has exactly one enrollment', async () => {
      const context = await helper.restoreToCheckpoint('students');
      
      await seeder.seed(context);
      
      const students = await prisma.student.findMany({
        where: { branchId: testBranchId },
        include: {
          enrollments: true
        }
      });
      
      students.forEach(student => {
        expect(student.enrollments).toHaveLength(1);
        expect(student.enrollments[0].studentId).toBe(student.id);
        expect(student.enrollments[0].sectionId).toBe(student.sectionId);
      });
    });

    it('should link enrollments to existing sections', async () => {
      const context = await helper.restoreToCheckpoint('students');
      
      await seeder.seed(context);
      
      const enrollments = await prisma.enrollment.findMany({
        where: { branchId: testBranchId },
        include: {
          section: true
        },
        take: 20
      });
      
      enrollments.forEach(enrollment => {
        expect(enrollment.section).toBeDefined();
        expect(enrollment.section.id).toBe(enrollment.sectionId);
        expect(enrollment.section.branchId).toBe(testBranchId);
      });
    });
  });

  describe('Performance', () => {
    it('should efficiently create enrollments for large student population', async () => {
      const context = await helper.restoreToCheckpoint('students');
      
      const startTime = Date.now();
      const result = await seeder.seed(context);
      const duration = Date.now() - startTime;
      
      console.log(`Created ${result.metrics.successCount} enrollments in ${duration}ms`);
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(10000); // 10 seconds
      
      // Verify all students are enrolled
      const studentCount = await prisma.student.count({
        where: { branchId: testBranchId }
      });
      const enrollmentCount = await prisma.enrollment.count({
        where: { branchId: testBranchId }
      });
      
      expect(enrollmentCount).toBe(studentCount);
    });
  });
});