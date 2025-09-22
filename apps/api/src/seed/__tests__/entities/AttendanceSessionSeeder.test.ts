/**
 * AttendanceSessionSeeder Tests - Direct Seeding
 * Tests attendance session generation for timetable periods
 */
import { AttendanceSessionSeeder } from '../../entities/AttendanceSessionSeeder';
import { TenantSeeder } from '../../entities/TenantSeeder';
import { SubjectSeeder } from '../../entities/SubjectSeeder';
import { ClassSeeder } from '../../entities/ClassSeeder';
import { TeacherSeeder } from '../../entities/TeacherSeeder';
import { ClassSubjectTeacherSeeder } from '../../entities/ClassSubjectTeacherSeeder';
import { TimeSlotSeeder } from '../../entities/TimeSlotSeeder';
import { RoomSeeder } from '../../entities/RoomSeeder';
import { TimetablePeriodSeeder } from '../../entities/TimetablePeriodSeeder';
import { SeedContext } from '../../core/interfaces';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run
describe('AttendanceSessionSeeder - Direct Tests', () => {
  let seeder: AttendanceSessionSeeder;
  let prisma: ReturnType<typeof getTestPrisma>;
  const testBranchId = 'test-direct-branch';
  beforeAll(async () => {
    prisma = getTestPrisma();
  });
  beforeEach(() => {
    seeder = new AttendanceSessionSeeder();
  });
  afterEach(async () => {
    // Clean up after each test
    await prisma.attendanceSession.deleteMany({ where: { branchId: testBranchId } });
    await prisma.timetablePeriod.deleteMany({ where: { branchId: testBranchId } });
    await prisma.timeSlot.deleteMany({ where: { branchId: testBranchId } });
    await prisma.room.deleteMany({ where: { branchId: testBranchId } });
    await prisma.classSubjectTeacher.deleteMany({ where: { branchId: testBranchId } });
    await prisma.section.deleteMany({ where: { branchId: testBranchId } });
    await prisma.class.deleteMany({ where: { branchId: testBranchId } });
    await prisma.teacher.deleteMany({ where: { branchId: testBranchId } });
    await prisma.staff.deleteMany({ where: { branchId: testBranchId } });
    await prisma.subject.deleteMany({ where: { branchId: testBranchId } });
    await prisma.academicYear.deleteMany({ where: { branchId: testBranchId } });
    await prisma.tenant.deleteMany({ where: { id: testBranchId } });
  });
  async function setupTestData(): Promise<SeedContext> {
    const context: SeedContext = {
      branchId: testBranchId,
      schoolId: 'test',
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
    // Create subjects
    const subjectSeeder = new SubjectSeeder();
    const subjectResult = await subjectSeeder.seed(context);
    if (!subjectResult.success) {
      throw new Error(`Failed to create subjects: ${subjectResult.errors?.join(', ')}`);
    }
    // Create classes and sections
    const classSeeder = new ClassSeeder();
    const classResult = await classSeeder.seed(context);
    if (!classResult.success) {
      throw new Error(`Failed to create classes: ${classResult.errors?.join(', ')}`);
    }
    // Create teachers
    const teacherSeeder = new TeacherSeeder();
    const teacherResult = await teacherSeeder.seed(context);
    if (!teacherResult.success) {
      throw new Error(`Failed to create teachers: ${teacherResult.errors?.join(', ')}`);
    }
    context.createdEntities.set('teachers', teacherResult.data);
    // Create class-subject-teacher assignments
    const classSubjectTeacherSeeder = new ClassSubjectTeacherSeeder();
    const assignmentResult = await classSubjectTeacherSeeder.seed(context);
    if (!assignmentResult.success) {
      throw new Error(`Failed to create assignments: ${assignmentResult.errors?.join(', ')}`);
    }
    // Create time slots
    const timeSlotSeeder = new TimeSlotSeeder();
    const timeSlotResult = await timeSlotSeeder.seed(context);
    if (!timeSlotResult.success) {
      throw new Error(`Failed to create time slots: ${timeSlotResult.errors?.join(', ')}`);
    }
    // Create rooms  
    const roomSeeder = new RoomSeeder();
    const roomResult = await roomSeeder.seed(context);
    if (!roomResult.success) {
      throw new Error(`Failed to create rooms: ${roomResult.errors?.join(', ')}`);
    }
    // Create academic year
    const academicYear = await prisma.academicYear.create({
      data: {
        branchId: testBranchId,
        name: '2024-25',
        startDate: '2024-04-01',
        endDate: '2025-03-31',
        isActive: true,
        terms: JSON.stringify(['Term 1', 'Term 2', 'Term 3'])
      }
    });
    context.createdEntities.set('academicYears', [academicYear]);
    // Create timetable periods
    const timetablePeriodSeeder = new TimetablePeriodSeeder();
    const periodResult = await timetablePeriodSeeder.seed(context);
    if (!periodResult.success) {
      throw new Error(`Failed to create timetable periods: ${periodResult.errors?.join(', ')}`);
    }
    return context;
  }
  describe('Basic Functionality', () => {
    it('should create attendance sessions for timetable periods', async () => {
      const context = await setupTestData();
      const result = await seeder.seed(context);
      // Debug log any errors
      if (result.errors) {
        console.log('Seeding errors:', result.errors);
      }
      expect(result.success).toBe(true);
      expect(result.metrics.totalRecords).toBeGreaterThan(0);
      // Verify sessions were created
      const sessionCount = await prisma.attendanceSession.count({
        where: { branchId: testBranchId }
      });
      console.log(`Created ${sessionCount} attendance sessions`);
      expect(sessionCount).toBeGreaterThan(0);
    });
    it('should create sessions for multiple dates', async () => {
      const context = await setupTestData();
      await seeder.seed(context);
      // Get unique dates from sessions
      const sessions = await prisma.attendanceSession.findMany({
        where: { branchId: testBranchId },
        select: { date: true },
        distinct: ['date']
      });
      // Should have sessions for at least 5 different dates (one week)
      expect(sessions.length).toBeGreaterThanOrEqual(5);
    });
    it('should assign correct teachers from timetable', async () => {
      const context = await setupTestData();
      await seeder.seed(context);
      // Get a sample of sessions with teacher assignments
      const sessions = await prisma.attendanceSession.findMany({
        where: { 
          branchId: testBranchId
        },
        include: {
          period: true,
          assignedTeacher: true
        },
        take: 10
      });
      // Verify teachers match the timetable period
      for (const session of sessions) {
        expect(session.assignedTeacherId).toBe(session.period.teacherId);
      }
    });
    it('should set correct status for sessions', async () => {
      const context = await setupTestData();
      await seeder.seed(context);
      // Check session statuses
      const scheduledSessions = await prisma.attendanceSession.count({
        where: { 
          branchId: testBranchId,
          status: 'scheduled'
        }
      });
      const completedSessions = await prisma.attendanceSession.count({
        where: { 
          branchId: testBranchId,
          status: 'completed'
        }
      });
      // Most sessions should be either scheduled or completed
      expect(scheduledSessions + completedSessions).toBeGreaterThan(0);
    });
    it('should link sessions to sections and subjects', async () => {
      const context = await setupTestData();
      await seeder.seed(context);
      // Get sessions with relations
      const sessions = await prisma.attendanceSession.findMany({
        where: { branchId: testBranchId },
        include: {
          section: true,
          subject: true
        },
        take: 20
      });
      sessions.forEach(session => {
        expect(session.section).toBeDefined();
        expect(session.subject).toBeDefined();
        expect(session.sectionId).toBe(session.section.id);
        expect(session.subjectId).toBe(session.subject.id);
      });
    });
  });
  describe('Idempotency', () => {
    it('should not create duplicate sessions on multiple runs', async () => {
      const context = await setupTestData();
      // First run
      const result1 = await seeder.seed(context);
      const count1 = await prisma.attendanceSession.count({
        where: { branchId: testBranchId }
      });
      // Second run
      const result2 = await seeder.seed(context);
      const count2 = await prisma.attendanceSession.count({
        where: { branchId: testBranchId }
      });
      // Should not create duplicates
      expect(count2).toBe(count1);
      expect(result2.metrics.totalRecords).toBe(0); // No new records created
    });
  });
  describe('Performance', () => {
    it('should efficiently create attendance sessions', async () => {
      const context = await setupTestData();
      const startTime = Date.now();
      const result = await seeder.seed(context);
      const duration = Date.now() - startTime;
      console.log(`Created ${result.metrics.successCount} sessions in ${duration}ms`);
      // Should complete within reasonable time
      expect(duration).toBeLessThan(10000); // 10 seconds
    });
  });
});