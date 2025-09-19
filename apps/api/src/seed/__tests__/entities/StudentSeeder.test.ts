/**
 * Tests for StudentSeeder Entity
 * Following TDD methodology - tests first, then implementation
 */

import { StudentSeeder } from '../../entities/StudentSeeder';
import { SeedContext } from '../../core/interfaces';
import { createTestSeedContext, assertEntitiesExist } from '../test-helpers';
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
      expect(seeder.dependencies).toEqual(['tenants', 'classes']);
    });

    it('should have correct priority', () => {
      expect(seeder.priority).toBe(25); // After classes
    });
  });

  describe('Data Generation', () => {
    it('should generate appropriate number of students', async () => {
      // Setup dependencies
      await setupBasicDependencies(prisma, context, testBranchId);
      await setupClassesWithSections(prisma, context, testBranchId, 3);

      const result = await seeder.seed(context);

      expect(result.success).toBe(true);
      expect(result.metrics.totalRecords).toBeGreaterThanOrEqual(100); // At least 100 students
      expect(result.entityName).toBe('students');

      // Verify students exist in database
      const students = await getTestPrisma().student.findMany({
        where: { branchId: context.branchId }
      });

      expect(students.length).toBeGreaterThanOrEqual(100);
    });

    it('should generate students with authentic Indian names', async () => {
      // Setup dependencies
      await setupBasicDependencies(prisma, context, testBranchId);
      await setupClassesWithSections(prisma, context, testBranchId, 1);

      await seeder.seed(context);

      const students = await getTestPrisma().student.findMany({
        where: { branchId: context.branchId },
        take: 10
      });

      students.forEach(student => {
        expect(student.firstName).toBeTruthy();
        expect(student.lastName).toBeTruthy();
        expect(student.firstName.length).toBeGreaterThan(2);
        expect(student.lastName.length).toBeGreaterThan(2);
      });
    });

    it('should assign students to classes evenly', async () => {
      // Setup dependencies
      const tenant = await getTestPrisma().tenant.create({
        data: {
          id: context.branchId,
          branchId: context.branchId,
          name: 'Test School',
          subdomain: 'test'
        }
      });

      const classes = [];
      for (let i = 1; i <= 3; i++) {
        const classData = await getTestPrisma().class.create({
          data: {
            id: `${context.branchId}-class-${i}`,
            branchId: context.branchId,
            name: `Class ${i}`,
            gradeLevel: i
          }
        });
        classes.push(classData);
        
        // Create sections for each class
        const sections = [];
        for (const sectionName of ['A', 'B']) {
          const section = await getTestPrisma().section.create({
            data: {
              id: `${context.branchId}-class-${i}-section-${sectionName}`,
              branchId: context.branchId,
              classId: classData.id,
              name: sectionName,
              capacity: 40
            }
          });
          sections.push(section);
        }
      }

      context.createdEntities.set('tenants', [tenant]);
      context.createdEntities.set('classes', classes);

      await seeder.seed(context);

      // Check distribution across classes
      for (const cls of classes) {
        const studentsInClass = await getTestPrisma().student.count({
          where: {
            branchId: context.branchId,
            classId: cls.id
          }
        });
        
        // Each class should have students
        expect(studentsInClass).toBeGreaterThan(0);
        // Should not exceed capacity
        expect(studentsInClass).toBeLessThanOrEqual(cls.studentCapacity);
      }
    });

    it('should generate valid enrollment numbers', async () => {
      // Setup dependencies
      const tenant = await getTestPrisma().tenant.create({
        data: {
          id: context.branchId,
          branchId: context.branchId,
          name: 'Test School',
          subdomain: 'test'
        }
      });

      const classData = await getTestPrisma().class.create({
        data: {
          id: `${context.branchId}-class-1`,
          branchId: context.branchId,
          name: 'Class X',
          academicLevel: 'Secondary',
          studentCapacity: 40,
          currentEnrollment: 0,
          fee: 10000,
          section: 'A'
        }
      });

      context.createdEntities.set('tenants', [tenant]);
      context.createdEntities.set('classes', [classData]);

      await seeder.seed(context);

      const students = await getTestPrisma().student.findMany({
        where: { branchId: context.branchId },
        take: 10
      });

      const enrollmentNumbers = new Set();
      students.forEach(student => {
        // Check format
        expect(student.enrollmentNumber).toMatch(/^STU\d{6}$/);
        // Check uniqueness
        expect(enrollmentNumbers.has(student.enrollmentNumber)).toBe(false);
        enrollmentNumbers.add(student.enrollmentNumber);
      });
    });

    it('should set appropriate date of birth', async () => {
      // Setup dependencies
      const tenant = await getTestPrisma().tenant.create({
        data: {
          id: context.branchId,
          branchId: context.branchId,
          name: 'Test School',
          subdomain: 'test'
        }
      });

      const classData = await getTestPrisma().class.create({
        data: {
          id: `${context.branchId}-class-1`,
          branchId: context.branchId,
          name: 'Class VI',
          academicLevel: 'Middle',
          studentCapacity: 40,
          currentEnrollment: 0,
          fee: 8000,
          section: 'A'
        }
      });

      context.createdEntities.set('tenants', [tenant]);
      context.createdEntities.set('classes', [classData]);

      await seeder.seed(context);

      const students = await getTestPrisma().student.findMany({
        where: { branchId: context.branchId },
        take: 10
      });

      const currentYear = new Date().getFullYear();
      
      students.forEach(student => {
        expect(student.dateOfBirth).toBeTruthy();
        const dobYear = parseInt(student.dateOfBirth.split('-')[0]);
        const age = currentYear - dobYear;
        
        // Age should be appropriate for school students (5-18 years)
        expect(age).toBeGreaterThanOrEqual(5);
        expect(age).toBeLessThanOrEqual(18);
      });
    });

    it('should generate valid contact information', async () => {
      // Setup dependencies
      const tenant = await getTestPrisma().tenant.create({
        data: {
          id: context.branchId,
          branchId: context.branchId,
          name: 'Test School',
          subdomain: 'test'
        }
      });

      const classData = await getTestPrisma().class.create({
        data: {
          id: `${context.branchId}-class-1`,
          branchId: context.branchId,
          name: 'Class VII',
          academicLevel: 'Middle',
          studentCapacity: 40,
          currentEnrollment: 0,
          fee: 8500,
          section: 'A'
        }
      });

      context.createdEntities.set('tenants', [tenant]);
      context.createdEntities.set('classes', [classData]);

      await seeder.seed(context);

      const students = await getTestPrisma().student.findMany({
        where: { branchId: context.branchId },
        take: 10
      });

      students.forEach(student => {
        // Check email format
        expect(student.email).toMatch(/^student\d+@school\.edu\.in$/);
        
        // Check phone format (Indian mobile)
        expect(student.phone).toMatch(/^\+91[6-9]\d{9}$/);
      });
    });

    it('should generate valid addresses', async () => {
      // Setup dependencies
      const tenant = await getTestPrisma().tenant.create({
        data: {
          id: context.branchId,
          branchId: context.branchId,
          name: 'Test School',
          subdomain: 'test'
        }
      });

      const classData = await getTestPrisma().class.create({
        data: {
          id: `${context.branchId}-class-1`,
          branchId: context.branchId,
          name: 'Class VIII',
          academicLevel: 'Middle',
          studentCapacity: 40,
          currentEnrollment: 0,
          fee: 9000,
          section: 'A'
        }
      });

      context.createdEntities.set('tenants', [tenant]);
      context.createdEntities.set('classes', [classData]);

      await seeder.seed(context);

      const students = await getTestPrisma().student.findMany({
        where: { branchId: context.branchId },
        take: 10
      });

      students.forEach(student => {
        expect(student.address).toBeTruthy();
        expect(student.city).toBeTruthy();
        expect(student.state).toBeTruthy();
        expect(student.pincode).toMatch(/^\d{6}$/); // Indian pincode format
      });
    });

    it('should set enrollment status correctly', async () => {
      // Setup dependencies
      const tenant = await getTestPrisma().tenant.create({
        data: {
          id: context.branchId,
          branchId: context.branchId,
          name: 'Test School',
          subdomain: 'test'
        }
      });

      const classData = await getTestPrisma().class.create({
        data: {
          id: `${context.branchId}-class-1`,
          branchId: context.branchId,
          name: 'Class IX',
          academicLevel: 'Secondary',
          studentCapacity: 40,
          currentEnrollment: 0,
          fee: 9500,
          section: 'A'
        }
      });

      context.createdEntities.set('tenants', [tenant]);
      context.createdEntities.set('classes', [classData]);

      await seeder.seed(context);

      const students = await getTestPrisma().student.findMany({
        where: { branchId: context.branchId }
      });

      students.forEach(student => {
        expect(student.enrollmentStatus).toBe('Active');
      });
    });

    it('should set admission dates correctly', async () => {
      // Setup dependencies
      const tenant = await getTestPrisma().tenant.create({
        data: {
          id: context.branchId,
          branchId: context.branchId,
          name: 'Test School',
          subdomain: 'test'
        }
      });

      const classData = await getTestPrisma().class.create({
        data: {
          id: `${context.branchId}-class-1`,
          branchId: context.branchId,
          name: 'Class XII',
          academicLevel: 'Senior Secondary',
          studentCapacity: 40,
          currentEnrollment: 0,
          fee: 12000,
          section: 'A'
        }
      });

      context.createdEntities.set('tenants', [tenant]);
      context.createdEntities.set('classes', [classData]);

      await seeder.seed(context);

      const students = await getTestPrisma().student.findMany({
        where: { branchId: context.branchId },
        take: 10
      });

      const currentYear = new Date().getFullYear();
      
      students.forEach(student => {
        expect(student.admissionDate).toBeTruthy();
        const admissionYear = parseInt(student.admissionDate.split('-')[0]);
        
        // Admission dates should be within last 12 years (for K-12)
        expect(admissionYear).toBeGreaterThanOrEqual(currentYear - 12);
        expect(admissionYear).toBeLessThanOrEqual(currentYear);
      });
    });
  });

  describe('Multi-branch Isolation', () => {
    it('should create students only for specified branch', async () => {
      // Setup dependencies
      const tenant = await getTestPrisma().tenant.create({
        data: {
          id: context.branchId,
          branchId: context.branchId,
          name: 'Test School',
          subdomain: 'test'
        }
      });

      const classData = await getTestPrisma().class.create({
        data: {
          id: `${context.branchId}-class-1`,
          branchId: context.branchId,
          name: 'Class XI',
          academicLevel: 'Senior Secondary',
          studentCapacity: 40,
          currentEnrollment: 0,
          fee: 11000,
          section: 'A'
        }
      });

      context.createdEntities.set('tenants', [tenant]);
      context.createdEntities.set('classes', [classData]);

      await seeder.seed(context);

      const branchStudents = await getTestPrisma().student.findMany({
        where: { branchId: 'test-dps-main' }
      });

      const otherStudents = await getTestPrisma().student.findMany({
        where: { branchId: { not: 'test-dps-main' } }
      });

      expect(branchStudents.length).toBeGreaterThan(0);
      expect(otherStudents.length).toBe(0);
    });
  });

  describe('Validation', () => {
    it('should validate successfully when students exist', async () => {
      // Setup dependencies
      const tenant = await getTestPrisma().tenant.create({
        data: {
          id: context.branchId,
          branchId: context.branchId,
          name: 'Test School',
          subdomain: 'test'
        }
      });

      const classData = await getTestPrisma().class.create({
        data: {
          id: `${context.branchId}-class-1`,
          branchId: context.branchId,
          name: 'Class IV',
          gradeLevel: 4
        }
      });

      context.createdEntities.set('tenants', [tenant]);
      context.createdEntities.set('classes', [classData]);

      await seeder.seed(context);
      
      const isValid = await seeder.validate(context);
      expect(isValid).toBe(true);
    });

    it('should fail validation when no students exist', async () => {
      const isValid = await seeder.validate(context);
      expect(isValid).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup seeded students', async () => {
      // Setup dependencies
      const tenant = await getTestPrisma().tenant.create({
        data: {
          id: context.branchId,
          branchId: context.branchId,
          name: 'Test School',
          subdomain: 'test'
        }
      });

      const classData = await getTestPrisma().class.create({
        data: {
          id: `${context.branchId}-class-1`,
          branchId: context.branchId,
          name: 'Class III',
          gradeLevel: 3
        }
      });

      context.createdEntities.set('tenants', [tenant]);
      context.createdEntities.set('classes', [classData]);

      await seeder.seed(context);
      
      const studentsBefore = await getTestPrisma().student.count({
        where: { branchId: context.branchId }
      });
      
      expect(studentsBefore).toBeGreaterThan(0);

      await seeder.cleanup(context);

      const studentsAfter = await getTestPrisma().student.count({
        where: { branchId: context.branchId }
      });
      
      expect(studentsAfter).toBe(0);
    });
  });

  describe('Progress Tracking', () => {
    it('should track progress during seeding', async () => {
      // Setup dependencies
      const tenant = await getTestPrisma().tenant.create({
        data: {
          id: context.branchId,
          branchId: context.branchId,
          name: 'Test School',
          subdomain: 'test'
        }
      });

      const classData = await getTestPrisma().class.create({
        data: {
          id: `${context.branchId}-class-1`,
          branchId: context.branchId,
          name: 'Class II',
          gradeLevel: 2
        }
      });

      context.createdEntities.set('tenants', [tenant]);
      context.createdEntities.set('classes', [classData]);

      const progressUpdates: any[] = [];
      context.logger.progress = jest.fn((update) => {
        progressUpdates.push(update);
      });

      await seeder.seed(context);

      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates.some(u => u.entityName === 'students')).toBe(true);
      expect(progressUpdates.some(u => u.stage === 'completed')).toBe(true);
    });
  });
});