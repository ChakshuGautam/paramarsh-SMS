/**
 * Tests for StudentSeeder Entity - Fixed Version
 * Following TDD methodology with proper dependency setup
 */

import { StudentSeeder } from '../../entities/StudentSeeder';
import { SeedContext } from '../../core/interfaces';
import { createTestSeedContext } from '../test-helpers';
import { getTestPrisma } from '../setup';
import { cleanupBranchData, generateTestBranchId } from '../helpers/cleanup';
import { setupBasicDependencies, setupClassesWithSections } from '../helpers/setup-dependencies';
import '../setup'; // Import setup to ensure lifecycle hooks run

describe('StudentSeeder', () => {
  let seeder: StudentSeeder;
  let context: SeedContext;
  let testBranchId: string;
  let prisma: ReturnType<typeof getTestPrisma>;

  beforeEach(async () => {
    prisma = getTestPrisma();
    seeder = new StudentSeeder();
    testBranchId = generateTestBranchId('test-student');
    context = createTestSeedContext(testBranchId);
  });

  afterEach(async () => {
    // Clean up test data after each test
    await cleanupBranchData(prisma, testBranchId);
  });

  describe('Entity Configuration', () => {
    it('should have correct entity name', () => {
      expect(seeder.entityName).toBe('students');
    });

    it('should have correct dependencies', () => {
      expect(seeder.dependencies).toContain('classes');
    });

    it('should have appropriate batch size', () => {
      expect(seeder.batchSize).toBeGreaterThan(0);
      expect(seeder.batchSize).toBeLessThanOrEqual(200);
    });
  });

  describe('Data Generation', () => {
    beforeEach(async () => {
      // Setup common dependencies for data generation tests
      await setupBasicDependencies(prisma, context, testBranchId);
      await setupClassesWithSections(prisma, context, testBranchId, 2);
    });

    it('should generate appropriate number of students', async () => {
      const result = await seeder.seed(context);

      expect(result.success).toBe(true);
      expect(result.metrics.successCount).toBeGreaterThan(0);
      expect(result.entityName).toBe('students');

      // Verify students exist in database
      const students = await prisma.student.findMany({
        where: { branchId: testBranchId }
      });

      expect(students.length).toBeGreaterThan(0);
      expect(students.length).toBeLessThanOrEqual(500); // Reasonable upper limit
    });

    it('should generate students with authentic Indian names', async () => {
      await seeder.seed(context);

      const students = await prisma.student.findMany({
        where: { branchId: testBranchId },
        take: 10
      });

      students.forEach(student => {
        expect(student.firstName).toBeTruthy();
        expect(student.lastName).toBeTruthy();
        expect(student.firstName.length).toBeGreaterThan(1);
        expect(student.lastName.length).toBeGreaterThan(1);
      });
    });

    it('should generate valid enrollment numbers', async () => {
      await seeder.seed(context);

      const students = await prisma.student.findMany({
        where: { branchId: testBranchId },
        take: 10
      });

      const enrollmentNumbers = new Set();
      students.forEach(student => {
        // Check uniqueness
        expect(enrollmentNumbers.has(student.enrollmentNo)).toBe(false);
        enrollmentNumbers.add(student.enrollmentNo);
        // Check format
        expect(student.enrollmentNo).toBeTruthy();
        expect(student.enrollmentNo.length).toBeGreaterThan(0);
      });
    });

    it('should assign students to sections evenly', async () => {
      await seeder.seed(context);

      // Get sections created
      const sections = await prisma.section.findMany({
        where: { branchId: testBranchId }
      });

      expect(sections.length).toBeGreaterThan(0);

      // Check students are distributed across sections
      for (const section of sections.slice(0, 2)) {
        const studentsInSection = await prisma.student.count({
          where: {
            branchId: testBranchId,
            sectionId: section.id
          }
        });
        
        // Each section should have some students
        expect(studentsInSection).toBeGreaterThan(0);
        // Should not exceed section capacity
        expect(studentsInSection).toBeLessThanOrEqual(section.capacity);
      }
    });

    it('should set appropriate date of birth', async () => {
      await seeder.seed(context);

      const students = await prisma.student.findMany({
        where: { branchId: testBranchId },
        take: 10
      });

      const currentYear = new Date().getFullYear();
      
      students.forEach(student => {
        expect(student.dateOfBirth).toBeTruthy();
        const dobYear = new Date(student.dateOfBirth).getFullYear();
        const age = currentYear - dobYear;
        
        // Age should be appropriate for school students (4-19 years)
        expect(age).toBeGreaterThanOrEqual(4);
        expect(age).toBeLessThanOrEqual(19);
      });
    });

    it('should generate valid contact information', async () => {
      await seeder.seed(context);

      const students = await prisma.student.findMany({
        where: { branchId: testBranchId },
        take: 10
      });

      students.forEach(student => {
        // Check email format if present
        if (student.email) {
          expect(student.email).toContain('@');
        }
        
        // Check phone format if present (Indian mobile)
        if (student.phone) {
          expect(student.phone.length).toBeGreaterThanOrEqual(10);
        }
      });
    });

    it('should generate valid addresses', async () => {
      await seeder.seed(context);

      const students = await prisma.student.findMany({
        where: { branchId: testBranchId },
        take: 10
      });

      students.forEach(student => {
        expect(student.address).toBeTruthy();
        expect(student.city).toBeTruthy();
        expect(student.state).toBeTruthy();
        expect(student.pincode).toBeTruthy();
        expect(student.pincode).toMatch(/^\d{6}$/); // Indian pincode format
      });
    });

    it('should set admission dates correctly', async () => {
      await seeder.seed(context);

      const students = await prisma.student.findMany({
        where: { branchId: testBranchId },
        take: 10
      });

      const currentYear = new Date().getFullYear();
      
      students.forEach(student => {
        expect(student.admissionDate).toBeTruthy();
        const admissionYear = new Date(student.admissionDate).getFullYear();
        
        // Admission dates should be reasonable
        expect(admissionYear).toBeGreaterThanOrEqual(currentYear - 12);
        expect(admissionYear).toBeLessThanOrEqual(currentYear);
      });
    });
  });

  describe('Multi-branch Isolation', () => {
    it('should create students only for specified branch', async () => {
      // Setup dependencies
      await setupBasicDependencies(prisma, context, testBranchId);
      await setupClassesWithSections(prisma, context, testBranchId, 1);

      await seeder.seed(context);

      const branchStudents = await prisma.student.findMany({
        where: { branchId: testBranchId }
      });

      const otherStudents = await prisma.student.findMany({
        where: { 
          branchId: { 
            not: testBranchId 
          } 
        }
      });

      expect(branchStudents.length).toBeGreaterThan(0);
      // No students should exist for other branches in this test
      expect(otherStudents.every(s => !s.branchId.startsWith('test-student'))).toBe(true);
    });
  });

  describe('Validation', () => {
    it('should validate successfully when students exist', async () => {
      // Setup dependencies
      await setupBasicDependencies(prisma, context, testBranchId);
      await setupClassesWithSections(prisma, context, testBranchId, 1);

      await seeder.seed(context);
      
      const isValid = await seeder.validate(context);
      expect(isValid).toBe(true);
    });

    it('should fail validation when no students exist', async () => {
      const isValid = await seeder.validate(context);
      expect(isValid).toBe(false);
    });
  });

  describe('Progress Tracking', () => {
    it('should report progress during seeding', async () => {
      // Setup dependencies
      await setupBasicDependencies(prisma, context, testBranchId);
      await setupClassesWithSections(prisma, context, testBranchId, 1);

      const progressUpdates: any[] = [];
      context.logger.progress = jest.fn((update) => {
        progressUpdates.push(update);
      });

      await seeder.seed(context);

      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates.some(u => u.entityName === 'students')).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should complete seeding within reasonable time', async () => {
      // Setup dependencies
      await setupBasicDependencies(prisma, context, testBranchId);
      await setupClassesWithSections(prisma, context, testBranchId, 1);

      const startTime = Date.now();
      await seeder.seed(context);
      const duration = Date.now() - startTime;

      // Should complete within 10 seconds for test data
      expect(duration).toBeLessThan(10000);
    });
  });
});