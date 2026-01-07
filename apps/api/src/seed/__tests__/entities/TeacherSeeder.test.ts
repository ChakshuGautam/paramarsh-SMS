/**
 * Tests for TeacherSeeder Entity
 * Following TDD methodology - tests first, then implementation
 */
import { TeacherSeeder } from '../../entities/TeacherSeeder';
import { SeedContext } from '../../core/interfaces';
import { createTestSeedContext, assertEntitiesExist } from '../test-helpers';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run
describe('TeacherSeeder', () => {
  let seeder: TeacherSeeder;
  let context: SeedContext;
  beforeEach(async () => {
    seeder = new TeacherSeeder();
    context = createTestSeedContext('test-dps-main');
  });
  afterEach(async () => {
    // Clean up test data in reverse dependency order
    await getTestPrisma().teacher.deleteMany({
      where: { branchId: context.branchId }
    });
    await getTestPrisma().staff.deleteMany({
      where: { branchId: context.branchId }
    });
    await getTestPrisma().subject.deleteMany({
      where: { branchId: context.branchId }
    });
    await getTestPrisma().tenant.deleteMany({
      where: { branchId: context.branchId }
    });
  });
  describe('Entity Configuration', () => {
    it('should have correct entity name', () => {
      expect(seeder.entityName).toBe('teachers');
    });
    it('should have correct dependencies', () => {
      expect(seeder.dependencies).toEqual(['tenants', 'subjects']);
    });
    it('should have correct priority', () => {
      expect(seeder.priority).toBe(20);
    });
  });
  describe('Data Generation', () => {
    it('should generate appropriate number of teachers', async () => {
      // Setup dependencies
      const tenant = await getTestPrisma().tenant.create({
        data: {
          id: context.branchId,
          branchId: context.branchId,
          name: 'Test School',
          subdomain: 'test'
        }
      });
      const subjects = await getTestPrisma().subject.createMany({
        data: [
          {
            code: 'MATH-01',
            name: 'Mathematics',
            description: 'Mathematics',
            credits: 4,
            isElective: false,
            branchId: context.branchId
          },
          {
            code: 'ENG-01',
            name: 'English',
            description: 'English',
            credits: 4,
            isElective: false,
            branchId: context.branchId
          },
          {
            code: 'SCI-01',
            name: 'Science',
            description: 'Science',
            credits: 4,
            isElective: false,
            branchId: context.branchId
          }
        ]
      });
      const subjectsData = await getTestPrisma().subject.findMany({
        where: { branchId: context.branchId }
      });
      context.createdEntities.set('tenants', [tenant]);
      context.createdEntities.set('subjects', subjectsData);
      const result = await seeder.seed(context);
      expect(result.success).toBe(true);
      expect(result.metrics.totalRecords).toBeGreaterThanOrEqual(30); // At least 30 teachers
      expect(result.entityName).toBe('teachers');
      // Verify teachers exist in database
      const teachers = await getTestPrisma().teacher.findMany({
        where: { branchId: context.branchId }
      });
      expect(teachers.length).toBeGreaterThanOrEqual(30);
    });
    it('should generate teachers with authentic Indian names', async () => {
      // Setup dependencies
      const tenant = await getTestPrisma().tenant.create({
        data: {
          id: context.branchId,
          branchId: context.branchId,
          name: 'Test School',
          subdomain: 'test'
        }
      });
      const subject = await getTestPrisma().subject.create({
        data: {
          code: 'MATH-01',
          name: 'Mathematics',
          description: 'Mathematics',
          credits: 4,
          isElective: false,
          branchId: context.branchId
        }
      });
      context.createdEntities.set('tenants', [tenant]);
      context.createdEntities.set('subjects', [subject]);
      await seeder.seed(context);
      const staff = await getTestPrisma().staff.findMany({
        where: { branchId: context.branchId }
      });
      // Check for Indian names
      staff.forEach(s => {
        expect(s.firstName).toBeTruthy();
        expect(s.lastName).toBeTruthy();
        expect(s.firstName.length).toBeGreaterThan(2);
        expect(s.lastName.length).toBeGreaterThan(2);
      });
    });
    it('should generate valid staff with proper details', async () => {
      // Setup dependencies
      const tenant = await getTestPrisma().tenant.create({
        data: {
          id: context.branchId,
          branchId: context.branchId,
          name: 'Test School',
          subdomain: 'test'
        }
      });
      const subject = await getTestPrisma().subject.create({
        data: {
          code: 'MATH-01',
          name: 'Mathematics',
          description: 'Mathematics',
          credits: 4,
          isElective: false,
          branchId: context.branchId
        }
      });
      context.createdEntities.set('tenants', [tenant]);
      context.createdEntities.set('subjects', [subject]);
      await seeder.seed(context);
      const staff = await getTestPrisma().staff.findMany({
        where: { branchId: context.branchId }
      });
      // Check staff details
      staff.forEach(s => {
        expect(s.designation).toBe('Teacher');
        expect(s.employmentType).toBe('Full-time');
        expect(s.status).toBe('Active');
        expect(s.department).toBeTruthy();
      });
    });
    it('should assign subjects to teachers', async () => {
      // Setup dependencies
      const tenant = await getTestPrisma().tenant.create({
        data: {
          id: context.branchId,
          branchId: context.branchId,
          name: 'Test School',
          subdomain: 'test'
        }
      });
      const subjects = await getTestPrisma().subject.createMany({
        data: [
          {
            code: 'MATH-01',
            name: 'Mathematics',
            description: 'Mathematics',
            credits: 4,
            isElective: false,
            branchId: context.branchId
          },
          {
            code: 'ENG-01',
            name: 'English',
            description: 'English',
            credits: 4,
            isElective: false,
            branchId: context.branchId
          }
        ]
      });
      const subjectsData = await getTestPrisma().subject.findMany({
        where: { branchId: context.branchId }
      });
      context.createdEntities.set('tenants', [tenant]);
      context.createdEntities.set('subjects', subjectsData);
      await seeder.seed(context);
      const teachers = await getTestPrisma().teacher.findMany({
        where: { branchId: context.branchId }
      });
      // Each teacher should have subjects assigned
      teachers.forEach(teacher => {
        expect(teacher.subjects).toBeTruthy();
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
      const subject = await getTestPrisma().subject.create({
        data: {
          code: 'MATH-01',
          name: 'Mathematics',
          description: 'Mathematics',
          credits: 4,
          isElective: false,
          branchId: context.branchId
        }
      });
      context.createdEntities.set('tenants', [tenant]);
      context.createdEntities.set('subjects', [subject]);
      await seeder.seed(context);
      const staff = await getTestPrisma().staff.findMany({
        where: { branchId: context.branchId }
      });
      staff.forEach(s => {
        // Check email format
        expect(s.email).toMatch(/^[a-z]+\.[a-z]+@school\.edu\.in$/);
        // Check phone format (Indian mobile)
        expect(s.phone).toMatch(/^\+91[6-9]\d{9}$/);
      });
    });
    it('should set appropriate qualifications', async () => {
      // Setup dependencies
      const tenant = await getTestPrisma().tenant.create({
        data: {
          id: context.branchId,
          branchId: context.branchId,
          name: 'Test School',
          subdomain: 'test'
        }
      });
      const subject = await getTestPrisma().subject.create({
        data: {
          code: 'MATH-01',
          name: 'Mathematics',
          description: 'Mathematics',
          credits: 4,
          isElective: false,
          branchId: context.branchId
        }
      });
      context.createdEntities.set('tenants', [tenant]);
      context.createdEntities.set('subjects', [subject]);
      await seeder.seed(context);
      const teachers = await getTestPrisma().teacher.findMany({
        where: { branchId: context.branchId }
      });
      const validQualifications = ['B.Ed', 'M.Ed', 'B.Sc B.Ed', 'M.Sc B.Ed', 'BA B.Ed', 'MA B.Ed', 'B.Tech B.Ed', 'M.Tech', 'MCA B.Ed', 'PhD', 'B.P.Ed', 'BFA'];
      teachers.forEach(teacher => {
        expect(teacher.qualifications).toBeTruthy();
        const hasValidQual = validQualifications.some(q => teacher.qualifications?.includes(q));
        expect(hasValidQual).toBe(true);
      });
    });
    it('should generate appropriate join dates', async () => {
      // Setup dependencies
      const tenant = await getTestPrisma().tenant.create({
        data: {
          id: context.branchId,
          branchId: context.branchId,
          name: 'Test School',
          subdomain: 'test'
        }
      });
      const subject = await getTestPrisma().subject.create({
        data: {
          code: 'MATH-01',
          name: 'Mathematics',
          description: 'Mathematics',
          credits: 4,
          isElective: false,
          branchId: context.branchId
        }
      });
      context.createdEntities.set('tenants', [tenant]);
      context.createdEntities.set('subjects', [subject]);
      await seeder.seed(context);
      const staff = await getTestPrisma().staff.findMany({
        where: { branchId: context.branchId }
      });
      const currentYear = new Date().getFullYear();
      staff.forEach(s => {
        expect(s.joinDate).toBeTruthy();
        const joinYear = parseInt(s.joinDate!.split('-')[0]);
        // Join dates should be within last 20 years
        expect(joinYear).toBeGreaterThanOrEqual(currentYear - 20);
        expect(joinYear).toBeLessThanOrEqual(currentYear);
      });
    });
    it('should set experience years correctly', async () => {
      // Setup dependencies
      const tenant = await getTestPrisma().tenant.create({
        data: {
          id: context.branchId,
          branchId: context.branchId,
          name: 'Test School',
          subdomain: 'test'
        }
      });
      const subject = await getTestPrisma().subject.create({
        data: {
          code: 'MATH-01',
          name: 'Mathematics',
          description: 'Mathematics',
          credits: 4,
          isElective: false,
          branchId: context.branchId
        }
      });
      context.createdEntities.set('tenants', [tenant]);
      context.createdEntities.set('subjects', [subject]);
      await seeder.seed(context);
      const teachers = await getTestPrisma().teacher.findMany({
        where: { branchId: context.branchId },
        include: { staff: true }
      });
      teachers.forEach(teacher => {
        if (teacher.experienceYears !== null && teacher.staff.joinDate) {
          const currentYear = new Date().getFullYear();
          const joinYear = parseInt(teacher.staff.joinDate.split('-')[0]);
          const expectedYears = currentYear - joinYear;
          expect(teacher.experienceYears).toBe(expectedYears);
        }
      });
    });
  });
  describe('Multi-branch Isolation', () => {
    it('should create teachers only for specified branch', async () => {
      // Setup dependencies
      const tenant = await getTestPrisma().tenant.create({
        data: {
          id: context.branchId,
          branchId: context.branchId,
          name: 'Test School',
          subdomain: 'test'
        }
      });
      const subject = await getTestPrisma().subject.create({
        data: {
          code: 'MATH-01',
          name: 'Mathematics',
          description: 'Mathematics',
          credits: 4,
          isElective: false,
          branchId: context.branchId
        }
      });
      context.createdEntities.set('tenants', [tenant]);
      context.createdEntities.set('subjects', [subject]);
      await seeder.seed(context);
      const branchTeachers = await getTestPrisma().teacher.findMany({
        where: { branchId: 'test-dps-main' }
      });
      const otherTeachers = await getTestPrisma().teacher.findMany({
        where: { branchId: { not: 'test-dps-main' } }
      });
      expect(branchTeachers.length).toBeGreaterThan(0);
      expect(otherTeachers.length).toBe(0);
    });
  });
  describe('Validation', () => {
    it('should validate successfully when teachers exist', async () => {
      // Setup dependencies
      const tenant = await getTestPrisma().tenant.create({
        data: {
          id: context.branchId,
          branchId: context.branchId,
          name: 'Test School',
          subdomain: 'test'
        }
      });
      const subject = await getTestPrisma().subject.create({
        data: {
          code: 'MATH-01',
          name: 'Mathematics',
          description: 'Mathematics',
          credits: 4,
          isElective: false,
          branchId: context.branchId
        }
      });
      context.createdEntities.set('tenants', [tenant]);
      context.createdEntities.set('subjects', [subject]);
      await seeder.seed(context);
      const isValid = await seeder.validate(context);
      expect(isValid).toBe(true);
    });
    it('should fail validation when no teachers exist', async () => {
      const isValid = await seeder.validate(context);
      expect(isValid).toBe(false);
    });
  });
  describe('Cleanup', () => {
    it('should cleanup seeded teachers and staff', async () => {
      // Setup dependencies
      const tenant = await getTestPrisma().tenant.create({
        data: {
          id: context.branchId,
          branchId: context.branchId,
          name: 'Test School',
          subdomain: 'test'
        }
      });
      const subject = await getTestPrisma().subject.create({
        data: {
          code: 'MATH-01',
          name: 'Mathematics',
          description: 'Mathematics',
          credits: 4,
          isElective: false,
          branchId: context.branchId
        }
      });
      context.createdEntities.set('tenants', [tenant]);
      context.createdEntities.set('subjects', [subject]);
      await seeder.seed(context);
      const teachersBefore = await getTestPrisma().teacher.count({
        where: { branchId: context.branchId }
      });
      const staffBefore = await getTestPrisma().staff.count({
        where: { branchId: context.branchId }
      });
      expect(teachersBefore).toBeGreaterThan(0);
      expect(staffBefore).toBeGreaterThan(0);
      await seeder.cleanup(context);
      const teachersAfter = await getTestPrisma().teacher.count({
        where: { branchId: context.branchId }
      });
      const staffAfter = await getTestPrisma().staff.count({
        where: { branchId: context.branchId }
      });
      expect(teachersAfter).toBe(0);
      expect(staffAfter).toBe(0);
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
      const subject = await getTestPrisma().subject.create({
        data: {
          code: 'MATH-01',
          name: 'Mathematics',
          description: 'Mathematics',
          credits: 4,
          isElective: false,
          branchId: context.branchId
        }
      });
      context.createdEntities.set('tenants', [tenant]);
      context.createdEntities.set('subjects', [subject]);
      const progressUpdates: any[] = [];
      context.logger.progress = jest.fn((update) => {
        progressUpdates.push(update);
      });
      await seeder.seed(context);
      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates.some(u => u.entityName === 'teachers')).toBe(true);
      expect(progressUpdates.some(u => u.stage === 'completed')).toBe(true);
    });
  });
});