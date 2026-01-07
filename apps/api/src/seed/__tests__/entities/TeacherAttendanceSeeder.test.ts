/**
 * TeacherAttendanceSeeder Tests - Direct Seeding
 * Tests teacher attendance record generation
 */
import { TeacherAttendanceSeeder } from '../../entities/TeacherAttendanceSeeder';
import { TenantSeeder } from '../../entities/TenantSeeder';
import { TeacherSeeder } from '../../entities/TeacherSeeder';
import { SeedContext } from '../../core/interfaces';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run
describe('TeacherAttendanceSeeder - Direct Tests', () => {
  let seeder: TeacherAttendanceSeeder;
  let prisma: ReturnType<typeof getTestPrisma>;
  const testBranchId = 'test-direct-branch';
  beforeAll(async () => {
    prisma = getTestPrisma();
  });
  beforeEach(() => {
    seeder = new TeacherAttendanceSeeder();
  });
  afterEach(async () => {
    // Clean up after each test
    await prisma.teacherAttendance.deleteMany({});
    await prisma.teacher.deleteMany({ where: { branchId: testBranchId } });
    await prisma.staff.deleteMany({ where: { branchId: testBranchId } });
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
    // Create teachers
    const teacherSeeder = new TeacherSeeder();
    const teacherResult = await teacherSeeder.seed(context);
    if (!teacherResult.success) {
      throw new Error(`Failed to create teachers: ${teacherResult.errors?.join(', ')}`);
    }
    context.createdEntities.set('teachers', teacherResult.data);
    return context;
  }
  describe('Basic Functionality', () => {
    it('should create teacher attendance records', async () => {
      const context = await setupTestData();
      const result = await seeder.seed(context);
      // Debug log any errors
      if (result.errors) {
        console.log('Seeding errors:', result.errors);
      }
      expect(result.success).toBe(true);
      expect(result.metrics.totalRecords).toBeGreaterThan(0);
      // Verify records were created
      const recordCount = await prisma.teacherAttendance.count();
      console.log(`Created ${recordCount} teacher attendance records`);
      expect(recordCount).toBeGreaterThan(0);
    });
    it('should create attendance for multiple dates', async () => {
      const context = await setupTestData();
      await seeder.seed(context);
      // Get unique dates
      const records = await prisma.teacherAttendance.findMany({
        select: { date: true },
        distinct: ['date']
      });
      // Should have records for at least 20 working days (about a month)
      expect(records.length).toBeGreaterThanOrEqual(20);
    });
    it('should set realistic check-in and check-out times', async () => {
      const context = await setupTestData();
      await seeder.seed(context);
      // Get present attendance records
      const presentRecords = await prisma.teacherAttendance.findMany({
        where: { status: 'present' },
        take: 10
      });
      presentRecords.forEach(record => {
        if (record.checkIn && record.checkOut) {
          const checkIn = new Date(record.checkIn);
          const checkOut = new Date(record.checkOut);
          // Check-in should be between 7 AM and 9 AM
          expect(checkIn.getHours()).toBeGreaterThanOrEqual(7);
          expect(checkIn.getHours()).toBeLessThanOrEqual(8);
          // Check-out should be between 3:00 PM and 6:00 PM
          expect(checkOut.getHours()).toBeGreaterThanOrEqual(15);
          expect(checkOut.getHours()).toBeLessThanOrEqual(18);
          // Check-out should be after check-in
          expect(checkOut.getTime()).toBeGreaterThan(checkIn.getTime());
        }
      });
    });
    it('should assign appropriate attendance statuses', async () => {
      const context = await setupTestData();
      await seeder.seed(context);
      // Check status distribution
      const presentCount = await prisma.teacherAttendance.count({
        where: { status: 'present' }
      });
      const absentCount = await prisma.teacherAttendance.count({
        where: { status: 'absent' }
      });
      const onLeaveCount = await prisma.teacherAttendance.count({
        where: { status: 'on_leave' }
      });
      const totalCount = presentCount + absentCount + onLeaveCount;
      // Most teachers should be present (>85%)
      expect(presentCount / totalCount).toBeGreaterThan(0.85);
      // Some should be absent or on leave (<15%)
      expect((absentCount + onLeaveCount) / totalCount).toBeLessThan(0.15);
    });
    it('should set leave types for on_leave status', async () => {
      const context = await setupTestData();
      await seeder.seed(context);
      // Get on leave records
      const leaveRecords = await prisma.teacherAttendance.findMany({
        where: { status: 'on_leave' }
      });
      if (leaveRecords.length > 0) {
        leaveRecords.forEach(record => {
          expect(record.leaveType).toBeDefined();
          expect(['sick', 'casual', 'earned', 'maternity', 'paternity']).toContain(record.leaveType);
        });
      }
    });
    it('should not have check-in/out times for absent/on_leave', async () => {
      const context = await setupTestData();
      await seeder.seed(context);
      // Get absent and on_leave records
      const nonPresentRecords = await prisma.teacherAttendance.findMany({
        where: {
          OR: [
            { status: 'absent' },
            { status: 'on_leave' }
          ]
        }
      });
      if (nonPresentRecords.length > 0) {
        nonPresentRecords.forEach(record => {
          expect(record.checkIn).toBeNull();
          expect(record.checkOut).toBeNull();
        });
      }
    });
  });
  describe('Idempotency', () => {
    it('should not create duplicate records on multiple runs', async () => {
      const context = await setupTestData();
      // First run
      const result1 = await seeder.seed(context);
      const count1 = await prisma.teacherAttendance.count();
      // Second run
      const result2 = await seeder.seed(context);
      const count2 = await prisma.teacherAttendance.count();
      // Should not create duplicates
      expect(count2).toBe(count1);
      expect(result2.metrics.totalRecords).toBe(0); // No new records created
    });
  });
  describe('Performance', () => {
    it('should efficiently create teacher attendance records', async () => {
      const context = await setupTestData();
      const startTime = Date.now();
      const result = await seeder.seed(context);
      const duration = Date.now() - startTime;
      console.log(`Created ${result.metrics.successCount} records in ${duration}ms`);
      // Should complete within reasonable time
      expect(duration).toBeLessThan(10000); // 10 seconds
    });
  });
});