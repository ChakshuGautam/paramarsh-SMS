/**
 * StudentSeeder Tests using Checkpoint System
 * Fast TDD by restoring to pre-seeded database states
 */
import { StudentSeeder } from '../../entities/StudentSeeder';
import { CheckpointTestHelper } from '../checkpoint-test-helper';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run
describe('StudentSeeder - Checkpoint Tests', () => {
  let helper: CheckpointTestHelper;
  let seeder: StudentSeeder;
  let prisma: ReturnType<typeof getTestPrisma>;
  const testBranchId = 'test-checkpoint-branch';
  beforeAll(async () => {
    prisma = getTestPrisma();
    helper = new CheckpointTestHelper({
      branchId: testBranchId,
      prisma,
      checkpointDir: '.test-checkpoints-student'
    });
    // Initialize checkpoints (creates them if they don't exist)
    await helper.initialize();
  });
  afterAll(async () => {
    await helper.cleanup();
  });
  beforeEach(() => {
    seeder = new StudentSeeder();
  });
  describe('Starting from Classes Checkpoint', () => {
    it('should generate students when classes and sections exist', async () => {
      // Restore to the point where classes and sections are created
      const context = await helper.restoreToCheckpoint('classes');
      // Verify we have classes and sections
      const classCount = await prisma.class.count({
        where: { branchId: testBranchId }
      });
      const sectionCount = await prisma.section.count({
        where: { branchId: testBranchId }
      });
      console.log(`Starting with ${classCount} classes and ${sectionCount} sections`);
      expect(classCount).toBeGreaterThan(0);
      expect(sectionCount).toBeGreaterThan(0);
      // Debug context before seeding
      console.log('Context has classes:', context.createdEntities.has('classes'));
      console.log('Context has sections:', context.createdEntities.has('sections'));
      // Now run StudentSeeder
      const result = await seeder.seed(context);
      if (!result.success) {
        console.log('StudentSeeder failed with errors:', result.errors);
      }
      expect(result.success).toBe(true);
      expect(result.metrics.totalRecords).toBeGreaterThan(0);
      // Verify students were created
      const studentCount = await prisma.student.count({
        where: { branchId: testBranchId }
      });
      expect(studentCount).toBe(result.metrics.totalRecords);
      // Check that students are distributed across sections
      const studentsWithSections = await prisma.student.count({
        where: { 
          branchId: testBranchId,
          sectionId: { not: null }
        }
      });
      expect(studentsWithSections).toBe(studentCount);
    });
    it('should maintain proper student-to-section ratio', async () => {
      const context = await helper.restoreToCheckpoint('classes');
      const sections = await prisma.section.findMany({
        where: { branchId: testBranchId }
      });
      const result = await seeder.seed(context);
      // Check each section has 30-40 students
      for (const section of sections) {
        const studentsInSection = await prisma.student.count({
          where: { 
            branchId: testBranchId,
            sectionId: section.id
          }
        });
        expect(studentsInSection).toBeGreaterThanOrEqual(30);
        expect(studentsInSection).toBeLessThanOrEqual(40);
      }
    });
  });
  describe('Incremental Testing', () => {
    it('should handle missing dependencies gracefully', async () => {
      // Start from a clean state (no checkpoints)
      await helper.restoreToCheckpoint('tenants'); // Only tenants exist
      const context = await helper.restoreToCheckpoint('tenants');
      const result = await seeder.seed(context);
      // Should fail because classes don't exist
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Missing dependency: classes');
    });
    it('should create consistent number of students per run', async () => {
      await helper.restoreToCheckpoint('classes');
      const context = await helper.restoreToCheckpoint('classes');
      // Run once
      const result1 = await seeder.seed(context);
      const count1 = await prisma.student.count({
        where: { branchId: testBranchId }
      });
      // Clear students and run again
      await prisma.student.deleteMany({
        where: { branchId: testBranchId }
      });
      const result2 = await seeder.seed(context);
      const count2 = await prisma.student.count({
        where: { branchId: testBranchId }
      });
      // Both runs should create roughly the same number of students
      // Allow for small variance due to randomization (30-40 per section)
      expect(Math.abs(count1 - count2)).toBeLessThanOrEqual(20 * 2); // 20 sections * max 1 student variance
    });
  });
  describe('Data Validation from Checkpoint', () => {
    it('should generate valid admission numbers', async () => {
      await helper.restoreToCheckpoint('classes');
      const context = await helper.restoreToCheckpoint('classes');
      await seeder.seed(context);
      const students = await prisma.student.findMany({
        where: { branchId: testBranchId },
        orderBy: { admissionNo: 'asc' }
      });
      // Check format and uniqueness
      const admissionNumbers = new Set<string>();
      students.forEach(student => {
        expect(student.admissionNo).toMatch(/^CBSE\d{8}$/);
        expect(admissionNumbers.has(student.admissionNo)).toBe(false);
        admissionNumbers.add(student.admissionNo);
      });
    });
    it('should assign sequential roll numbers per section', async () => {
      await helper.restoreToCheckpoint('classes');
      const context = await helper.restoreToCheckpoint('classes');
      await seeder.seed(context);
      const sections = await prisma.section.findMany({
        where: { branchId: testBranchId }
      });
      for (const section of sections) {
        const students = await prisma.student.findMany({
          where: { 
            branchId: testBranchId,
            sectionId: section.id
          }
        });
        // Sort by numeric value of roll number
        students.sort((a, b) => parseInt(a.rollNumber) - parseInt(b.rollNumber));
        console.log(`Section ${section.name}: ${students.length} students`);
        console.log(`Roll numbers: ${students.slice(0, 5).map(s => s.rollNumber).join(', ')}...`);
        students.forEach((student, index) => {
          expect(student.rollNumber).toBe(String(index + 1));
        });
      }
    });
  });
  describe('Performance Testing with Checkpoints', () => {
    it('should seed large number of students efficiently', async () => {
      await helper.restoreToCheckpoint('classes');
      const context = await helper.restoreToCheckpoint('classes');
      const startTime = Date.now();
      const result = await seeder.seed(context);
      const duration = Date.now() - startTime;
      console.log(`Seeded ${result.metrics.totalRecords} students in ${duration}ms`);
      // Should complete within reasonable time (adjust based on your needs)
      expect(duration).toBeLessThan(5000); // 5 seconds
      // Verify batch processing worked
      expect(result.metrics.totalRecords).toBeGreaterThan(100);
    });
  });
});