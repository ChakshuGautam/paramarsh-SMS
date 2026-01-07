/**
 * Comprehensive Tests for StudentSeeder Entity
 * Based on old seed.ts logic - ensuring new implementation matches expected output
 */
import { StudentSeeder } from '../../entities/StudentSeeder';
import { SeedContext } from '../../core/interfaces';
import { createTestSeedContext } from '../test-helpers';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run
describe('StudentSeeder - Comprehensive Tests', () => {
  let seeder: StudentSeeder;
  let context: SeedContext;
  let prisma: ReturnType<typeof getTestPrisma>;
  beforeAll(() => {
    prisma = getTestPrisma();
  });
  beforeEach(async () => {
    seeder = new StudentSeeder();
    context = createTestSeedContext('test-dps-main');
    // Clean up any existing test data
    await prisma.enrollment.deleteMany({ where: { branchId: context.branchId } });
    await prisma.studentGuardian.deleteMany({ where: { student: { branchId: context.branchId } } });
    await prisma.guardian.deleteMany({ where: { branchId: context.branchId } });
    await prisma.student.deleteMany({ where: { branchId: context.branchId } });
    await prisma.section.deleteMany({ where: { branchId: context.branchId } });
    await prisma.class.deleteMany({ where: { branchId: context.branchId } });
    await prisma.tenant.deleteMany({ where: { branchId: context.branchId } });
  });
  afterEach(async () => {
    // Clean up test data in reverse dependency order
    await prisma.enrollment.deleteMany({ where: { branchId: context.branchId } });
    await prisma.studentGuardian.deleteMany({ where: { student: { branchId: context.branchId } } });
    await prisma.guardian.deleteMany({ where: { branchId: context.branchId } });
    await prisma.student.deleteMany({ where: { branchId: context.branchId } });
    await prisma.section.deleteMany({ where: { branchId: context.branchId } });
    await prisma.class.deleteMany({ where: { branchId: context.branchId } });
    await prisma.tenant.deleteMany({ where: { branchId: context.branchId } });
  });
  describe('Student Generation Logic', () => {
    beforeEach(async () => {
      // Setup minimal dependencies
      const tenant = await prisma.tenant.create({
        data: {
          id: context.branchId,
          branchId: context.branchId,
          name: 'Test School',
          subdomain: 'test'
        }
      });
      // Add tenant to context (StudentSeeder checks for it)
      context.createdEntities.set('tenants', [tenant]);
      // Create classes with sections (matching old seed structure)
      const classes = await Promise.all([
        prisma.class.create({
          data: {
            id: `${context.branchId}-class-1`,
            branchId: context.branchId,
            name: 'Class 1',
            gradeLevel: 1
          }
        }),
        prisma.class.create({
          data: {
            id: `${context.branchId}-class-5`,
            branchId: context.branchId,
            name: 'Class 5',
            gradeLevel: 5
          }
        }),
        prisma.class.create({
          data: {
            id: `${context.branchId}-class-10`,
            branchId: context.branchId,
            name: 'Class 10',
            gradeLevel: 10
          }
        })
      ]);
      // Create sections for each class (matching old pattern)
      const sections = [];
      for (const cls of classes) {
        const sectionNames = ['A', 'B', 'C']; // Default sections from old seed
        for (const sectionName of sectionNames) {
          const section = await prisma.section.create({
            data: {
              branchId: context.branchId,
              name: sectionName,
              classId: cls.id,
              capacity: 35 // Default from old seed
            }
          });
          sections.push(section);
        }
      }
      context.createdEntities.set('classes', classes);
      context.createdEntities.set('sections', sections);
    });
    it('should generate students distributed across sections', async () => {
      const result = await seeder.seed(context);
      if (!result.success) {
        console.error('Seeding failed:', result.errors);
      }
      expect(result.success).toBe(true);
      const students = await prisma.student.findMany({
        where: { branchId: context.branchId }
      });
      // Check distribution across sections
      const sectionDistribution = new Map<string, number>();
      students.forEach(student => {
        if (student.sectionId) {
          sectionDistribution.set(
            student.sectionId,
            (sectionDistribution.get(student.sectionId) || 0) + 1
          );
        }
      });
      // Each section should have students (30-40 based on old logic)
      sectionDistribution.forEach((count, sectionId) => {
        expect(count).toBeGreaterThanOrEqual(25); // Allow some variance
        expect(count).toBeLessThanOrEqual(40);
      });
    });
    it('should generate admission numbers in CBSE format', async () => {
      const result = await seeder.seed(context);
      const students = await prisma.student.findMany({
        where: { branchId: context.branchId },
        orderBy: { admissionNo: 'asc' }
      });
      students.forEach((student, index) => {
        // Format: CBSE20250001, CBSE20250002, etc.
        expect(student.admissionNo).toMatch(/^CBSE2025\d{4}$/);
      });
      // Check sequential numbering
      const numbers = students.map(s => 
        parseInt(s.admissionNo.replace('CBSE2025', ''))
      );
      for (let i = 1; i < numbers.length; i++) {
        expect(numbers[i]).toBeGreaterThan(numbers[i - 1]);
      }
    });
    it('should generate authentic Indian names', async () => {
      const result = await seeder.seed(context);
      const students = await prisma.student.findMany({
        where: { branchId: context.branchId }
      });
      const indianFirstNames = [
        'Aarav', 'Arjun', 'Vivaan', 'Aditya', 'Ishaan', 'Aadhya', 
        'Saanvi', 'Aarohi', 'Ananya', 'Diya', 'Kavya', 'Navya'
      ];
      const indianLastNames = [
        'Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Reddy', 
        'Rao', 'Patel', 'Shah', 'Mehta', 'Joshi', 'Desai'
      ];
      // At least 50% should have recognizable Indian names
      const indianNameCount = students.filter(s => 
        indianFirstNames.some(name => s.firstName.includes(name)) ||
        indianLastNames.some(name => s.lastName.includes(name))
      ).length;
      expect(indianNameCount).toBeGreaterThan(students.length * 0.5);
    });
    it('should assign appropriate roll numbers per section', async () => {
      const result = await seeder.seed(context);
      const sections = await prisma.section.findMany({
        where: { branchId: context.branchId }
      });
      for (const section of sections) {
        const studentsInSection = await prisma.student.findMany({
          where: { 
            branchId: context.branchId,
            sectionId: section.id
          },
          orderBy: { rollNumber: 'asc' }
        });
        // Roll numbers should be sequential starting from 1
        studentsInSection.forEach((student, index) => {
          expect(student.rollNumber).toBe(String(index + 1));
        });
      }
    });
    it('should generate age-appropriate DOBs', async () => {
      const result = await seeder.seed(context);
      const students = await prisma.student.findMany({
        where: { branchId: context.branchId },
        include: { section: { include: { class: true } } }
      });
      const currentYear = new Date().getFullYear();
      students.forEach(student => {
        const birthYear = new Date(student.dob).getFullYear();
        const gradeLevel = student.section?.class?.gradeLevel || 1;
        // Age should be grade level + 4 years (±1 year variance)
        const expectedBirthYear = currentYear - gradeLevel - 4;
        expect(birthYear).toBeGreaterThanOrEqual(expectedBirthYear - 1);
        expect(birthYear).toBeLessThanOrEqual(expectedBirthYear + 1);
      });
    });
    it('should set realistic student statuses based on grade level', async () => {
      const result = await seeder.seed(context);
      const students = await prisma.student.findMany({
        where: { branchId: context.branchId },
        include: { section: { include: { class: true } } }
      });
      // Group by grade level
      const gradeGroups = new Map<number, any[]>();
      students.forEach(student => {
        const grade = student.section?.class?.gradeLevel || 1;
        if (!gradeGroups.has(grade)) {
          gradeGroups.set(grade, []);
        }
        gradeGroups.get(grade)?.push(student);
      });
      // Check status distribution per grade
      gradeGroups.forEach((gradeStudents, gradeLevel) => {
        const statusCounts = {
          active: gradeStudents.filter(s => s.status === 'active').length,
          inactive: gradeStudents.filter(s => s.status === 'inactive').length,
          graduated: gradeStudents.filter(s => s.status === 'graduated').length
        };
        const total = gradeStudents.length;
        if (gradeLevel >= 10) {
          // Higher grades: more graduated students
          expect(statusCounts.graduated / total).toBeGreaterThanOrEqual(0.3);
        } else if (gradeLevel <= 2) {
          // Lower grades: mostly active
          expect(statusCounts.active / total).toBeGreaterThanOrEqual(0.7);
        }
      });
    });
    it('should maintain gender distribution with slight male preference', async () => {
      const result = await seeder.seed(context);
      const students = await prisma.student.findMany({
        where: { branchId: context.branchId }
      });
      const maleCount = students.filter(s => s.gender === 'male').length;
      const femaleCount = students.filter(s => s.gender === 'female').length;
      // Should have slight male preference (52% male as per old seed)
      const maleRatio = maleCount / students.length;
      expect(maleRatio).toBeGreaterThanOrEqual(0.48);
      expect(maleRatio).toBeLessThanOrEqual(0.56);
    });
    it('should not exceed section capacity', async () => {
      const result = await seeder.seed(context);
      const sections = await prisma.section.findMany({
        where: { branchId: context.branchId }
      });
      for (const section of sections) {
        const studentsInSection = await prisma.student.count({
          where: { 
            branchId: context.branchId,
            sectionId: section.id
          }
        });
        expect(studentsInSection).toBeLessThanOrEqual(section.capacity);
      }
    });
  });
  describe('Data Consistency', () => {
    it('should ensure all students have valid class and section references', async () => {
      // Setup dependencies
      const tenant = await prisma.tenant.create({
        data: {
          id: context.branchId,
          branchId: context.branchId,
          name: 'Test School',
          subdomain: 'test'
        }
      });
      context.createdEntities.set('tenants', [tenant]);
      const cls = await prisma.class.create({
        data: {
          id: `${context.branchId}-class-1`,
          branchId: context.branchId,
          name: 'Class 1',
          gradeLevel: 1
        }
      });
      const section = await prisma.section.create({
        data: {
          branchId: context.branchId,
          name: 'A',
          classId: cls.id,
          capacity: 35
        }
      });
      context.createdEntities.set('classes', [cls]);
      context.createdEntities.set('sections', [section]);
      const result = await seeder.seed(context);
      const students = await prisma.student.findMany({
        where: { branchId: context.branchId }
      });
      students.forEach(student => {
        expect(student.classId).toBeTruthy();
        expect(student.sectionId).toBeTruthy();
      });
    });
  });
  describe('Comparison with Old Seed Data', () => {
    it('should generate similar number of students as old seed', async () => {
      // Setup with multiple sections like old seed
      const tenant = await prisma.tenant.create({
        data: {
          id: context.branchId,
          branchId: context.branchId,
          name: 'Test School',
          subdomain: 'test'
        }
      });
      context.createdEntities.set('tenants', [tenant]);
      // Create 3 classes with 3 sections each (9 sections total)
      const classes = [];
      const sections = [];
      for (let i = 1; i <= 3; i++) {
        const cls = await prisma.class.create({
          data: {
            id: `${context.branchId}-class-${i}`,
            branchId: context.branchId,
            name: `Class ${i}`,
            gradeLevel: i
          }
        });
        classes.push(cls);
        for (const sectionName of ['A', 'B', 'C']) {
          const section = await prisma.section.create({
            data: {
              branchId: context.branchId,
              name: sectionName,
              classId: cls.id,
              capacity: 35
            }
          });
          sections.push(section);
        }
      }
      context.createdEntities.set('classes', classes);
      context.createdEntities.set('sections', sections);
      const result = await seeder.seed(context);
      const students = await prisma.student.count({
        where: { branchId: context.branchId }
      });
      // Old seed generates 30-40 students per section
      // 9 sections × ~35 students = ~315 students
      expect(students).toBeGreaterThanOrEqual(270); // 9 × 30
      expect(students).toBeLessThanOrEqual(360);   // 9 × 40
    });
  });
});