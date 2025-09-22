/**
 * StudentPeriodAttendanceSeeder Tests - Direct Seeding
 * Tests student attendance record generation for attendance sessions
 */
import { StudentPeriodAttendanceSeeder } from '../../entities/StudentPeriodAttendanceSeeder';
import { TenantSeeder } from '../../entities/TenantSeeder';
import { SubjectSeeder } from '../../entities/SubjectSeeder';
import { ClassSeeder } from '../../entities/ClassSeeder';
import { TeacherSeeder } from '../../entities/TeacherSeeder';
import { StudentSeeder } from '../../entities/StudentSeeder';
import { GuardianSeeder } from '../../entities/GuardianSeeder';
import { EnrollmentSeeder } from '../../entities/EnrollmentSeeder';
import { ClassSubjectTeacherSeeder } from '../../entities/ClassSubjectTeacherSeeder';
import { TimeSlotSeeder } from '../../entities/TimeSlotSeeder';
import { RoomSeeder } from '../../entities/RoomSeeder';
import { TimetablePeriodSeeder } from '../../entities/TimetablePeriodSeeder';
import { AttendanceSessionSeeder } from '../../entities/AttendanceSessionSeeder';
import { SeedContext } from '../../core/interfaces';
import { getTestPrisma } from '../setup';
import { cleanupBranchData, generateTestBranchId } from '../helpers/cleanup';
import '../setup'; // Import setup to ensure lifecycle hooks run
describe('StudentPeriodAttendanceSeeder - Direct Tests', () => {
  let seeder: StudentPeriodAttendanceSeeder;
  let prisma: ReturnType<typeof getTestPrisma>;
  let testBranchId: string;
  beforeEach(async () => {
    prisma = getTestPrisma();
    seeder = new StudentPeriodAttendanceSeeder();
    testBranchId = generateTestBranchId('test-spa');
  });
  afterEach(async () => {
    // Clean up test data after each test
    await cleanupBranchData(prisma, testBranchId);
    await prisma.subject.deleteMany({ where: { branchId: testBranchId } });
    await prisma.academicYear.deleteMany({ where: { branchId: testBranchId } });
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
    // Create academic year first (needed by enrollments)
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
    // Create students first (before guardians)
    const studentSeeder = new StudentSeeder();
    const studentResult = await studentSeeder.seed(context);
    if (!studentResult.success) {
      throw new Error(`Failed to create students: ${studentResult.errors?.join(', ')}`);
    }
    // Create guardians (after students, as they depend on students)
    const guardianSeeder = new GuardianSeeder();
    const guardianResult = await guardianSeeder.seed(context);
    if (!guardianResult.success) {
      throw new Error(`Failed to create guardians: ${guardianResult.errors?.join(', ')}`);
    }
    // Create enrollments
    const enrollmentSeeder = new EnrollmentSeeder();
    const enrollmentResult = await enrollmentSeeder.seed(context);
    if (!enrollmentResult.success) {
      throw new Error(`Failed to create enrollments: ${enrollmentResult.errors?.join(', ')}`);
    }
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
    // Create timetable periods
    const timetablePeriodSeeder = new TimetablePeriodSeeder();
    const periodResult = await timetablePeriodSeeder.seed(context);
    if (!periodResult.success) {
      throw new Error(`Failed to create timetable periods: ${periodResult.errors?.join(', ')}`);
    }
    // Create attendance sessions
    const attendanceSessionSeeder = new AttendanceSessionSeeder();
    const sessionResult = await attendanceSessionSeeder.seed(context);
    if (!sessionResult.success) {
      throw new Error(`Failed to create attendance sessions: ${sessionResult.errors?.join(', ')}`);
    }
    return context;
  }
  describe('Basic Functionality', () => {
    it('should create attendance records for students', async () => {
      const context = await setupTestData();
      const result = await seeder.seed(context);
      // Debug log any errors
      if (result.errors) {
        console.log('Seeding errors:', result.errors);
      }
      expect(result.success).toBe(true);
      expect(result.metrics.totalRecords).toBeGreaterThan(0);
      // Verify records were created
      const recordCount = await prisma.studentPeriodAttendance.count();
      console.log(`Created ${recordCount} student attendance records`);
      expect(recordCount).toBeGreaterThan(0);
    });
    it('should create records for all enrolled students in sessions', async () => {
      const context = await setupTestData();
      await seeder.seed(context);
      // Get a completed session
      const session = await prisma.attendanceSession.findFirst({
        where: { 
          branchId: testBranchId,
          status: 'completed'
        },
        include: {
          section: true
        }
      });
      if (session) {
        // Get enrolled students in this section
        const enrollments = await prisma.enrollment.count({
          where: {
            branchId: testBranchId,
            sectionId: session.sectionId,
            status: 'active'
          }
        });
        // Get attendance records for this session
        const records = await prisma.studentPeriodAttendance.count({
          where: {
            sessionId: session.id
          }
        });
        // Should have records for all enrolled students
        expect(records).toBe(enrollments);
      }
    });
    it('should assign realistic attendance statuses', async () => {
      const context = await setupTestData();
      await seeder.seed(context);
      // Check attendance status distribution
      const presentCount = await prisma.studentPeriodAttendance.count({
        where: { status: 'present' }
      });
      const absentCount = await prisma.studentPeriodAttendance.count({
        where: { status: 'absent' }
      });
      const lateCount = await prisma.studentPeriodAttendance.count({
        where: { status: 'late' }
      });
      const totalCount = presentCount + absentCount + lateCount;
      // Most students should be present (>80%)
      expect(presentCount / totalCount).toBeGreaterThan(0.8);
      // Some should be absent (<10%)
      expect(absentCount / totalCount).toBeLessThan(0.1);
      // Some should be late (<10%)
      expect(lateCount / totalCount).toBeLessThan(0.1);
    });
    it('should set late minutes for late students', async () => {
      const context = await setupTestData();
      await seeder.seed(context);
      // Get late attendance records
      const lateRecords = await prisma.studentPeriodAttendance.findMany({
        where: { 
          status: 'late',
          minutesLate: { not: null }
        }
      });
      lateRecords.forEach(record => {
        expect(record.minutesLate).toBeGreaterThan(0);
        expect(record.minutesLate).toBeLessThanOrEqual(30); // Max 30 minutes late
      });
    });
    it('should set markedBy as the session teacher', async () => {
      const context = await setupTestData();
      await seeder.seed(context);
      // Get records with their sessions
      const records = await prisma.studentPeriodAttendance.findMany({
        include: {
          session: true
        },
        take: 20
      });
      records.forEach(record => {
        expect(record.markedBy).toBe(record.session.assignedTeacherId);
      });
    });
  });
  describe('Idempotency', () => {
    it('should not create duplicate records on multiple runs', async () => {
      const context = await setupTestData();
      // First run
      const result1 = await seeder.seed(context);
      const count1 = await prisma.studentPeriodAttendance.count();
      // Second run
      const result2 = await seeder.seed(context);
      const count2 = await prisma.studentPeriodAttendance.count();
      // Should not create duplicates
      expect(count2).toBe(count1);
      expect(result2.metrics.totalRecords).toBe(0); // No new records created
    });
  });
  describe('Performance', () => {
    it('should efficiently create attendance records', async () => {
      const context = await setupTestData();
      const startTime = Date.now();
      const result = await seeder.seed(context);
      const duration = Date.now() - startTime;
      console.log(`Created ${result.metrics.successCount} records in ${duration}ms`);
      // Should complete within reasonable time
      expect(duration).toBeLessThan(15000); // 15 seconds
    });
  });
});