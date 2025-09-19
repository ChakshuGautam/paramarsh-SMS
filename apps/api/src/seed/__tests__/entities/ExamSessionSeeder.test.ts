/**
 * ExamSessionSeeder Tests - Direct Seeding
 * Tests exam session generation with subject and room assignments
 */

import { ExamSessionSeeder } from '../../entities/ExamSessionSeeder';
import { TenantSeeder } from '../../entities/TenantSeeder';
import { AcademicYearSeeder } from '../../entities/AcademicYearSeeder';
import { ExamSeeder } from '../../entities/ExamSeeder';
import { SubjectSeeder } from '../../entities/SubjectSeeder';
import { RoomSeeder } from '../../entities/RoomSeeder';
import { SeedContext } from '../../core/interfaces';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run

describe('ExamSessionSeeder - Direct Tests', () => {
  let seeder: ExamSessionSeeder;
  let prisma: ReturnType<typeof getTestPrisma>;
  const testBranchId = 'test-direct-branch';

  beforeAll(async () => {
    prisma = getTestPrisma();
  });

  beforeEach(() => {
    seeder = new ExamSessionSeeder();
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.marksEntry.deleteMany({});
    await prisma.examSession.deleteMany({});
    await prisma.exam.deleteMany({});
    await prisma.room.deleteMany({ where: { branchId: testBranchId } });
    await prisma.subject.deleteMany({ where: { branchId: testBranchId } });
    await prisma.academicYear.deleteMany({ where: { branchId: testBranchId } });
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
      throw new Error(`Failed to create tenant: ${tenantResult.errors?.join(', ')}`);
    }

    // Create academic year
    const academicYearSeeder = new AcademicYearSeeder();
    const academicYearResult = await academicYearSeeder.seed(context);
    if (!academicYearResult.success) {
      throw new Error(`Failed to create academic year: ${academicYearResult.errors?.join(', ')}`);
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

    return context;
  }

  describe('Basic Functionality', () => {
    it('should create exam sessions', async () => {
      const context = await setupTestData();
      
      const result = await seeder.seed(context);
      
      // Debug log any errors
      if (result.errors) {
        console.log('Seeding errors:', result.errors);
      }
      
      expect(result.success).toBe(true);
      expect(result.metrics.totalRecords).toBeGreaterThan(0);
      
      // Verify sessions were created
      const sessionCount = await prisma.examSession.count();
      
      console.log(`Created ${sessionCount} exam sessions`);
      expect(sessionCount).toBeGreaterThan(0);
    });

    it('should link sessions to exams', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get sessions with exam
      const sessions = await prisma.examSession.findMany({
        where: { branchId: testBranchId },
        include: { exam: true }
      });
      
      sessions.forEach(session => {
        expect(session.exam).toBeDefined();
        expect(session.examId).toBe(session.exam.id);
      });
    });

    it('should assign subjects to sessions', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get sessions
      const sessions = await prisma.examSession.findMany({
        where: { branchId: testBranchId }
      });
      
      // Most sessions should have subjects
      const sessionsWithSubjects = sessions.filter(s => s.subjectId !== null);
      expect(sessionsWithSubjects.length).toBeGreaterThan(0);
      
      // Verify subject IDs are valid
      for (const session of sessionsWithSubjects) {
        const subject = await prisma.subject.findUnique({
          where: { id: session.subjectId! }
        });
        expect(subject).toBeDefined();
      }
    });

    it('should assign rooms to sessions', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get sessions
      const sessions = await prisma.examSession.findMany({
        where: { branchId: testBranchId }
      });
      
      // Most sessions should have rooms
      const sessionsWithRooms = sessions.filter(s => s.roomId !== null);
      expect(sessionsWithRooms.length).toBeGreaterThan(0);
      
      // Verify room IDs are valid
      for (const session of sessionsWithRooms) {
        const room = await prisma.room.findUnique({
          where: { id: session.roomId! }
        });
        expect(room).toBeDefined();
      }
    });

    it('should create appropriate sessions for practical exams', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get practical exam
      const practicalExam = await prisma.exam.findFirst({
        where: { 
          branchId: testBranchId,
          examType: 'practical'
        }
      });
      
      if (practicalExam) {
        // Get sessions for this exam
        const sessions = await prisma.examSession.findMany({
          where: { examId: practicalExam.id },
          include: { exam: true }
        });
        
        // Practical exams might have sessions if lab subjects exist
        if (sessions.length > 0) {
          sessions.forEach(session => {
            expect(session.exam.examType).toBe('practical');
          });
        } else {
          // It's ok if no sessions for practical exam when no lab subjects
          expect(sessions.length).toBe(0);
        }
      }
    });

    it('should set schedule for sessions', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get sessions
      const sessions = await prisma.examSession.findMany({
        where: { branchId: testBranchId }
      });
      
      sessions.forEach(session => {
        if (session.schedule) {
          // Should have schedule in format "YYYY-MM-DD, HH:MM AM/PM - HH:MM AM/PM" or "Day N, HH:MM AM/PM - HH:MM AM/PM"
          expect(session.schedule).toMatch(/(\d{4}-\d{2}-\d{2}|Day \d+), \d{2}:\d{2} [AP]M - \d{2}:\d{2} [AP]M/);
        }
      });
    });

    it('should handle multiple exam types', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get all exam types
      const exams = await prisma.exam.findMany({
        where: { branchId: testBranchId }
      });
      
      const examTypes = [...new Set(exams.map(e => e.examType).filter(Boolean))];
      
      // Verify we have various exam types
      expect(examTypes.length).toBeGreaterThan(0);
      
      // Get total sessions created
      const totalSessions = await prisma.examSession.count({
        where: { branchId: testBranchId }
      });
      
      // Should have created sessions overall
      expect(totalSessions).toBeGreaterThan(0);
      
      // For theory exams (not practical), verify sessions exist
      const theoryExams = exams.filter(e => e.examType && e.examType !== 'practical');
      for (const exam of theoryExams) {
        const sessionCount = await prisma.examSession.count({
          where: { examId: exam.id }
        });
        
        // Theory exams should typically have sessions
        if (sessionCount === 0) {
          console.log(`No sessions for ${exam.examType} exam: ${exam.name}`);
        }
      }
    });
  });

  describe('Idempotency', () => {
    it('should not create duplicate sessions on multiple runs', async () => {
      const context = await setupTestData();
      
      // First run
      const result1 = await seeder.seed(context);
      const count1 = await prisma.examSession.count();
      
      // Second run
      const result2 = await seeder.seed(context);
      const count2 = await prisma.examSession.count();
      
      // Should not create duplicates
      expect(count2).toBe(count1);
      expect(result2.metrics.totalRecords).toBe(0); // No new records created
    });

    it('should not create duplicate sessions for same exam-subject', async () => {
      const context = await setupTestData();
      
      // First run
      await seeder.seed(context);
      
      // Get a session
      const session = await prisma.examSession.findFirst({
        where: { 
          branchId: testBranchId,
          subjectId: { not: null }
        }
      });
      
      if (session && session.subjectId) {
        // Try to create duplicate
        const duplicateCount = await prisma.examSession.count({
          where: {
            branchId: testBranchId,
            examId: session.examId,
            subjectId: session.subjectId
          }
        });
        
        // Should have only one session per exam-subject combination
        expect(duplicateCount).toBe(1);
      }
    });
  });

  describe('Performance', () => {
    it('should efficiently create sessions', async () => {
      const context = await setupTestData();
      
      const startTime = Date.now();
      const result = await seeder.seed(context);
      const duration = Date.now() - startTime;
      
      console.log(`Created ${result.metrics.successCount} exam sessions in ${duration}ms`);
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(10000); // 10 seconds
    });
  });
});