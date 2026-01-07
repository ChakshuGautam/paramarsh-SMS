/**
 * GuardianSeeder Tests using Checkpoint System
 * Tests guardian generation and student relationships
 */
import { GuardianSeeder } from '../../entities/GuardianSeeder';
import { CheckpointTestHelper } from '../checkpoint-test-helper';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run
describe('GuardianSeeder - Checkpoint Tests', () => {
  let helper: CheckpointTestHelper;
  let seeder: GuardianSeeder;
  let prisma: ReturnType<typeof getTestPrisma>;
  const testBranchId = 'test-checkpoint-branch';
  beforeAll(async () => {
    prisma = getTestPrisma();
    helper = new CheckpointTestHelper({
      branchId: testBranchId,
      prisma,
      checkpointDir: '.test-checkpoints-guardian'
    });
    // Initialize checkpoints (creates them if they don't exist)
    await helper.initialize();
  });
  afterAll(async () => {
    await helper.cleanup();
  });
  beforeEach(() => {
    seeder = new GuardianSeeder();
  });
  describe('Starting from Students Checkpoint', () => {
    it('should generate guardians for all student families', async () => {
      // Restore to the point where students exist
      const context = await helper.restoreToCheckpoint('students');
      // Verify we have students
      const studentCount = await prisma.student.count({
        where: { branchId: testBranchId }
      });
      console.log(`Starting with ${studentCount} students`);
      expect(studentCount).toBeGreaterThan(0);
      // Now run GuardianSeeder
      const result = await seeder.seed(context);
      expect(result.success).toBe(true);
      expect(result.metrics.totalRecords).toBeGreaterThan(0);
      // Verify guardians were created
      const guardianCount = await prisma.guardian.count({
        where: { branchId: testBranchId }
      });
      console.log(`Created ${guardianCount} guardians`);
      expect(guardianCount).toBeGreaterThan(0);
      // Verify student-guardian relationships
      const relationshipCount = await prisma.studentGuardian.count({
        where: { 
          student: { branchId: testBranchId }
        }
      });
      console.log(`Created ${relationshipCount} student-guardian relationships`);
      expect(relationshipCount).toBeGreaterThan(0);
    });
    it('should create appropriate guardian-student relationships', async () => {
      const context = await helper.restoreToCheckpoint('students');
      await seeder.seed(context);
      // Check that students have guardians
      const studentsWithGuardians = await prisma.student.findMany({
        where: { branchId: testBranchId },
        include: {
          guardians: {
            include: {
              guardian: true
            }
          }
        },
        take: 10 // Sample check
      });
      for (const student of studentsWithGuardians) {
        // Each student should have at least 1 guardian
        expect(student.guardians.length).toBeGreaterThanOrEqual(1);
        expect(student.guardians.length).toBeLessThanOrEqual(2); // Max 2 (both parents)
        // Verify guardian name includes student's last name (family consistency)
        for (const rel of student.guardians) {
          expect(rel.guardian.name).toContain(student.lastName);
        }
      }
    });
    it('should assign realistic guardian occupations', async () => {
      const context = await helper.restoreToCheckpoint('students');
      await seeder.seed(context);
      const guardians = await prisma.guardian.findMany({
        where: { branchId: testBranchId },
        take: 20
      });
      const validOccupations = [
        'Engineer', 'Doctor', 'Teacher', 'Business Owner', 'Government Employee',
        'Lawyer', 'Accountant', 'Bank Manager', 'Software Developer', 'Architect',
        'Dentist', 'Pharmacist', 'Professor', 'Consultant', 'Entrepreneur',
        'Civil Servant', 'Police Officer', 'Armed Forces', 'Scientist', 'Designer'
      ];
      guardians.forEach(guardian => {
        expect(validOccupations).toContain(guardian.occupation);
      });
    });
  });
  describe('Family Grouping', () => {
    it('should group siblings under same guardians', async () => {
      const context = await helper.restoreToCheckpoint('students');
      await seeder.seed(context);
      // Find students with same last name (potential siblings)
      const lastNames = await prisma.student.groupBy({
        by: ['lastName'],
        where: { branchId: testBranchId },
        _count: true,
        having: {
          lastName: {
            _count: {
              gt: 1 // Families with multiple students
            }
          }
        }
      });
      // Check first family with multiple students
      if (lastNames.length > 0) {
        const familyName = lastNames[0].lastName;
        const familyStudents = await prisma.student.findMany({
          where: { 
            branchId: testBranchId,
            lastName: familyName
          },
          include: {
            guardians: {
              include: {
                guardian: true
              }
            }
          }
        });
        // All students in family should share same guardians
        if (familyStudents.length > 1) {
          const firstStudentGuardianIds = familyStudents[0].guardians
            .map(g => g.guardianId)
            .sort();
          for (let i = 1; i < familyStudents.length; i++) {
            const guardianIds = familyStudents[i].guardians
              .map(g => g.guardianId)
              .sort();
            // Same guardian IDs for siblings
            expect(guardianIds).toEqual(firstStudentGuardianIds);
          }
        }
      }
    });
  });
  describe('Data Validation', () => {
    it('should generate valid Indian phone numbers', async () => {
      const context = await helper.restoreToCheckpoint('students');
      await seeder.seed(context);
      const guardians = await prisma.guardian.findMany({
        where: { branchId: testBranchId },
        take: 20
      });
      guardians.forEach(guardian => {
        // Indian phone format: +91XXXXXXXXXX
        expect(guardian.phoneNumber).toMatch(/^\+91\d{10}$/);
      });
    });
    it('should generate valid email addresses', async () => {
      const context = await helper.restoreToCheckpoint('students');
      await seeder.seed(context);
      const guardians = await prisma.guardian.findMany({
        where: { branchId: testBranchId },
        take: 20
      });
      guardians.forEach(guardian => {
        expect(guardian.email).toMatch(/^[a-z]+\.[a-z]+\d*@[a-z]+\.com$/);
        // Email should be based on guardian's name
        const [firstName, lastName] = guardian.name.split(' ');
        expect(guardian.email.toLowerCase()).toContain(firstName.toLowerCase());
        expect(guardian.email.toLowerCase()).toContain(lastName.toLowerCase());
      });
    });
    it('should set alternate phone numbers for some guardians', async () => {
      const context = await helper.restoreToCheckpoint('students');
      await seeder.seed(context);
      const guardians = await prisma.guardian.findMany({
        where: { branchId: testBranchId }
      });
      const withAlternatePhone = guardians.filter(g => g.alternatePhoneNumber);
      const percentage = (withAlternatePhone.length / guardians.length) * 100;
      // About 50% should have alternate phone numbers
      expect(percentage).toBeGreaterThan(40);
      expect(percentage).toBeLessThan(60);
    });
  });
  describe('Incremental Testing', () => {
    it('should handle missing students dependency gracefully', async () => {
      // Start from a state with no students
      const context = await helper.restoreToCheckpoint('classes');
      const result = await seeder.seed(context);
      // Should fail because students don't exist
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Missing dependency: students');
    });
  });
  describe('Performance Testing', () => {
    it('should efficiently create guardians for large student population', async () => {
      const context = await helper.restoreToCheckpoint('students');
      const startTime = Date.now();
      const result = await seeder.seed(context);
      const duration = Date.now() - startTime;
      console.log(`Created ${result.metrics.successCount} guardians in ${duration}ms`);
      // Should complete within reasonable time
      expect(duration).toBeLessThan(10000); // 10 seconds
      // Verify reasonable guardian count (less than students due to family grouping)
      const studentCount = await prisma.student.count({
        where: { branchId: testBranchId }
      });
      const guardianCount = await prisma.guardian.count({
        where: { branchId: testBranchId }
      });
      // Should have fewer guardians than students (families share guardians)
      expect(guardianCount).toBeLessThan(studentCount);
      // But should have reasonable coverage
      expect(guardianCount).toBeGreaterThan(studentCount * 0.1); // At least 10% ratio (many siblings)
    });
  });
});