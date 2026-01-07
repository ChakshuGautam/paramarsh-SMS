/**
 * MarkSeeder Tests - Direct Seeding
 * Tests marks entry generation for exam sessions
 */
import { MarkSeeder } from '../../entities/MarkSeeder';
import { TenantSeeder } from '../../entities/TenantSeeder';
import { ClassSeeder } from '../../entities/ClassSeeder';
import { StudentSeeder } from '../../entities/StudentSeeder';
import { AcademicYearSeeder } from '../../entities/AcademicYearSeeder';
import { ExamSeeder } from '../../entities/ExamSeeder';
import { SubjectSeeder } from '../../entities/SubjectSeeder';
import { RoomSeeder } from '../../entities/RoomSeeder';
import { ExamSessionSeeder } from '../../entities/ExamSessionSeeder';
import { SeedContext } from '../../core/interfaces';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run
describe('MarkSeeder - Direct Tests', () => {
  let seeder: MarkSeeder;
  let prisma: ReturnType<typeof getTestPrisma>;
  const testBranchId = 'test-direct-branch';
  beforeAll(async () => {
    prisma = getTestPrisma();
  });
  beforeEach(() => {
    seeder = new MarkSeeder();
  });
  afterEach(async () => {
    // Clean up after each test
    await prisma.marksEntry.deleteMany({});
    await prisma.examSession.deleteMany({});
    await prisma.exam.deleteMany({});
    await prisma.room.deleteMany({ where: { branchId: testBranchId } });
    await prisma.subject.deleteMany({ where: { branchId: testBranchId } });
    await prisma.student.deleteMany({ where: { branchId: testBranchId } });
    await prisma.academicYear.deleteMany({ where: { branchId: testBranchId } });
    await prisma.section.deleteMany({ where: { branchId: testBranchId } });
    await prisma.class.deleteMany({ where: { branchId: testBranchId } });
    await prisma.tenant.deleteMany({ where: { id: testBranchId } });
  });
  async function setupTestData(): Promise<SeedContext> {
    const context: SeedContext = {
      schoolId: 'test',
      branchId: testBranchId,
      options: { batchSize: 50, skipValidation: false, dryRun: false, verbose: false, parallel: false, maxRetries: 1 },
      prisma,
      createdEntities: new Map(),
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        progress: jest.fn(),
        metrics: jest.fn()
      } as any
    };
    // Create tenant
    const tenantSeeder = new TenantSeeder();
    const tenantResult = await tenantSeeder.seed(context);
    if (!tenantResult.success) {
      throw new Error(`Failed to create tenant: ${tenantResult.errors?.join(', ')}`);
    }
    // Create classes
    const classSeeder = new ClassSeeder();
    const classResult = await classSeeder.seed(context);
    if (!classResult.success) {
      throw new Error(`Failed to create classes: ${classResult.errors?.join(', ')}`);
    }
    // Create academic year
    const academicYearSeeder = new AcademicYearSeeder();
    const academicYearResult = await academicYearSeeder.seed(context);
    if (!academicYearResult.success) {
      throw new Error(`Failed to create academic year: ${academicYearResult.errors?.join(', ')}`);
    }
    // Create students
    const studentSeeder = new StudentSeeder();
    const studentResult = await studentSeeder.seed(context);
    if (!studentResult.success) {
      throw new Error(`Failed to create students: ${studentResult.errors?.join(', ')}`);
    }
    // Create exams
    const examSeeder = new ExamSeeder();
    const examResult = await examSeeder.seed(context);
    if (!examResult.success) {
      throw new Error(`Failed to create exams: ${examResult.errors?.join(', ')}`);
    }
    // Create subjects
    const subjectSeeder = new SubjectSeeder();
    const subjectResult = await subjectSeeder.seed(context);
    if (!subjectResult.success) {
      throw new Error(`Failed to create subjects: ${subjectResult.errors?.join(', ')}`);
    }
    // Create rooms
    const roomSeeder = new RoomSeeder();
    const roomResult = await roomSeeder.seed(context);
    if (!roomResult.success) {
      throw new Error(`Failed to create rooms: ${roomResult.errors?.join(', ')}`);
    }
    // Create exam sessions
    const sessionSeeder = new ExamSessionSeeder();
    const sessionResult = await sessionSeeder.seed(context);
    if (!sessionResult.success) {
      throw new Error(`Failed to create exam sessions: ${sessionResult.errors?.join(', ')}`);
    }
    return context;
  }
  describe('Basic Functionality', () => {
    it('should create marks for completed exam sessions', async () => {
      const context = await setupTestData();
      const result = await seeder.seed(context);
      // Debug log any errors
      if (result.errors) {
        console.log('Seeding errors:', result.errors);
      }
      expect(result.success).toBe(true);
      // Verify marks were created
      const markCount = await prisma.marksEntry.count();
      console.log(`Created ${markCount} marks entries`);
      // Should have created marks for completed exams
      const completedExamCount = await prisma.exam.count({
        where: { 
          branchId: testBranchId,
          status: 'COMPLETED'
        }
      });
      if (completedExamCount > 0) {
        expect(markCount).toBeGreaterThan(0);
      }
    });
    it('should link marks to students and sessions', async () => {
      const context = await setupTestData();
      await seeder.seed(context);
      // Get marks with relations
      const marks = await prisma.marksEntry.findMany({
        where: { branchId: testBranchId },
        include: {
          student: true,
          session: true
        },
        take: 10
      });
      marks.forEach(mark => {
        expect(mark.student).toBeDefined();
        expect(mark.studentId).toBe(mark.student.id);
        expect(mark.session).toBeDefined();
        expect(mark.sessionId).toBe(mark.session.id);
      });
    });
    it('should generate realistic mark distribution', async () => {
      const context = await setupTestData();
      await seeder.seed(context);
      // Get all marks
      const marks = await prisma.marksEntry.findMany({
        where: { branchId: testBranchId }
      });
      if (marks.length > 0) {
        // Check mark distribution
        const passingMarks = marks.filter(m => {
          const grade = m.grade;
          return grade && !['D', 'F'].includes(grade);
        });
        const failingMarks = marks.filter(m => {
          const grade = m.grade;
          return grade && ['D', 'F'].includes(grade);
        });
        // Roughly 70-80% should pass
        const passRate = passingMarks.length / marks.length;
        console.log(`Pass rate: ${(passRate * 100).toFixed(2)}%`);
        // Pass rate should be realistic (between 50% and 90%)
        expect(passRate).toBeGreaterThan(0.5);
        expect(passRate).toBeLessThan(0.95);
      }
    });
    it('should assign appropriate grades', async () => {
      const context = await setupTestData();
      await seeder.seed(context);
      // Get marks
      const marks = await prisma.marksEntry.findMany({
        where: { branchId: testBranchId }
      });
      const validGrades = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];
      marks.forEach(mark => {
        if (mark.grade) {
          expect(validGrades).toContain(mark.grade);
        }
      });
      // Should have variety of grades
      const uniqueGrades = [...new Set(marks.map(m => m.grade).filter(Boolean))];
      if (marks.length > 10) {
        expect(uniqueGrades.length).toBeGreaterThan(3);
      }
    });
    it('should add appropriate comments', async () => {
      const context = await setupTestData();
      await seeder.seed(context);
      // Get marks
      const marks = await prisma.marksEntry.findMany({
        where: { branchId: testBranchId }
      });
      marks.forEach(mark => {
        if (mark.comments) {
          expect(mark.comments).toBeTruthy();
          expect(mark.comments.length).toBeGreaterThan(5);
        }
      });
    });
    it('should only create marks for completed exams', async () => {
      const context = await setupTestData();
      await seeder.seed(context);
      // Get marks with session and exam
      const marks = await prisma.marksEntry.findMany({
        where: { branchId: testBranchId },
        include: {
          session: {
            include: {
              exam: true
            }
          }
        }
      });
      // All marks should be for completed exams
      marks.forEach(mark => {
        expect(mark.session.exam.status).toBe('COMPLETED');
      });
    });
    it('should handle raw marks within exam limits', async () => {
      const context = await setupTestData();
      await seeder.seed(context);
      // Get marks with exam details
      const marks = await prisma.marksEntry.findMany({
        where: { branchId: testBranchId },
        include: {
          session: {
            include: {
              exam: true
            }
          }
        }
      });
      marks.forEach(mark => {
        if (mark.rawMarks !== null && mark.session.exam.maxMarks) {
          // Raw marks should not exceed max marks
          expect(mark.rawMarks).toBeLessThanOrEqual(mark.session.exam.maxMarks);
          // Raw marks should be non-negative
          expect(mark.rawMarks).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });
  describe('Idempotency', () => {
    it('should not create duplicate marks on multiple runs', async () => {
      const context = await setupTestData();
      // First run
      const result1 = await seeder.seed(context);
      const count1 = await prisma.marksEntry.count();
      // Second run
      const result2 = await seeder.seed(context);
      const count2 = await prisma.marksEntry.count();
      // Should not create duplicates
      expect(count2).toBe(count1);
      expect(result2.metrics.totalRecords).toBe(0); // No new records created
    });
    it('should not create multiple marks for same student-session', async () => {
      const context = await setupTestData();
      // First run
      await seeder.seed(context);
      // Get a mark
      const mark = await prisma.marksEntry.findFirst({
        where: { branchId: testBranchId }
      });
      if (mark) {
        // Count marks for same student-session
        const duplicateCount = await prisma.marksEntry.count({
          where: {
            studentId: mark.studentId,
            sessionId: mark.sessionId
          }
        });
        // Should have only one mark per student-session
        expect(duplicateCount).toBe(1);
      }
    });
  });
  describe('Performance', () => {
    it('should efficiently create marks', async () => {
      const context = await setupTestData();
      const startTime = Date.now();
      const result = await seeder.seed(context);
      const duration = Date.now() - startTime;
      console.log(`Created ${result.metrics.successCount} marks in ${duration}ms`);
      // Should complete within reasonable time
      expect(duration).toBeLessThan(20000); // 20 seconds
    });
  });
});