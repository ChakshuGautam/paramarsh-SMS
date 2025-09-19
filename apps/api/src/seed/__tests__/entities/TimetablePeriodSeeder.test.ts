/**
 * TimetablePeriodSeeder Tests - Direct Seeding
 * Tests timetable period generation
 */

import { TimetablePeriodSeeder } from '../../entities/TimetablePeriodSeeder';
import { TenantSeeder } from '../../entities/TenantSeeder';
import { SubjectSeeder } from '../../entities/SubjectSeeder';
import { ClassSeeder } from '../../entities/ClassSeeder';
import { TeacherSeeder } from '../../entities/TeacherSeeder';
import { ClassSubjectTeacherSeeder } from '../../entities/ClassSubjectTeacherSeeder';
import { TimeSlotSeeder } from '../../entities/TimeSlotSeeder';
import { RoomSeeder } from '../../entities/RoomSeeder';
import { SeedContext } from '../../core/interfaces';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run

describe('TimetablePeriodSeeder - Direct Tests', () => {
  let seeder: TimetablePeriodSeeder;
  let prisma: ReturnType<typeof getTestPrisma>;
  const testBranchId = 'test-direct-branch';

  beforeAll(async () => {
    prisma = getTestPrisma();
  });

  beforeEach(() => {
    seeder = new TimetablePeriodSeeder();
  });

  afterEach(async () => {
    // Clean up after each test
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
    // Manually add teachers to context since TeacherSeeder doesn't do it
    context.createdEntities.set('teachers', teacherResult.data);

    // Create class-subject-teacher assignments
    const classSubjectTeacherSeeder = new ClassSubjectTeacherSeeder();
    const assignmentResult = await classSubjectTeacherSeeder.seed(context);
    if (!assignmentResult.success) {
      throw new Error(`Failed to create assignments: ${assignmentResult.errors?.join(', ')}`);
    }
    // The seeder sets 'classSubjectTeacher' not 'classSubjectTeachers'
    // We don't need to manually set it as the seeder does it

    // Create time slots
    const timeSlotSeeder = new TimeSlotSeeder();
    const timeSlotResult = await timeSlotSeeder.seed(context);
    if (!timeSlotResult.success) {
      throw new Error(`Failed to create time slots: ${timeSlotResult.errors?.join(', ')}`);
    }
    // The seeder sets 'timeSlots' in createdEntities

    // Create rooms  
    const roomSeeder = new RoomSeeder();
    const roomResult = await roomSeeder.seed(context);
    if (!roomResult.success) {
      throw new Error(`Failed to create rooms: ${roomResult.errors?.join(', ')}`);
    }
    // The seeder sets 'rooms' in createdEntities

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
    
    // Add to context as some seeders might look for it
    context.createdEntities.set('academicYears', [academicYear]);

    return context;
  }

  describe('Basic Functionality', () => {
    it('should create timetable periods', async () => {
      const context = await setupTestData();
      
      const result = await seeder.seed(context);
      
      // Debug log any errors
      if (result.errors) {
        console.log('Seeding errors:', result.errors);
      }
      
      expect(result.success).toBe(true);
      expect(result.metrics.totalRecords).toBeGreaterThan(0);
      
      // Verify periods were created
      const periodCount = await prisma.timetablePeriod.count({
        where: { branchId: testBranchId }
      });
      
      console.log(`Created ${periodCount} timetable periods`);
      expect(periodCount).toBeGreaterThan(100); // At least 100 periods
    });

    it('should create periods for all sections', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get all sections
      const sections = await prisma.section.findMany({
        where: { branchId: testBranchId }
      });
      
      // Check each section has timetable periods
      for (const section of sections) {
        const sectionPeriods = await prisma.timetablePeriod.count({
          where: { 
            branchId: testBranchId,
            sectionId: section.id
          }
        });
        
        // Each section should have periods for a week (around 35-40 periods)
        expect(sectionPeriods).toBeGreaterThan(30);
        expect(sectionPeriods).toBeLessThan(50);
      }
    });

    it('should assign teachers based on subject assignments', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get some periods with teacher assignments
      const periodsWithTeachers = await prisma.timetablePeriod.findMany({
        where: { 
          branchId: testBranchId,
          teacherId: { not: null }
        },
        include: {
          teacher: true,
          subject: true
        }
      });
      
      expect(periodsWithTeachers.length).toBeGreaterThan(0);
      
      // Verify teachers are assigned to their subjects
      for (const period of periodsWithTeachers.slice(0, 10)) {
        expect(period.teacher).toBeDefined();
        expect(period.subject).toBeDefined();
      }
    });

    it('should assign rooms to periods', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Check that periods have rooms assigned
      const periodsWithRooms = await prisma.timetablePeriod.findMany({
        where: { 
          branchId: testBranchId,
          roomId: { not: null }
        }
      });
      
      expect(periodsWithRooms.length).toBeGreaterThan(100);
    });

    it('should avoid teacher conflicts', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get all periods for a specific day and period number
      const periodsInSlot = await prisma.timetablePeriod.findMany({
        where: { 
          branchId: testBranchId,
          dayOfWeek: 1, // Monday
          periodNumber: 1  // First period
        }
      });
      
      if (periodsInSlot.length > 0) {
        // Check no teacher is assigned to multiple sections at the same time
        const teacherIds = periodsInSlot
          .filter(p => p.teacherId)
          .map(p => p.teacherId);
        const uniqueTeacherIds = new Set(teacherIds);
        
        expect(uniqueTeacherIds.size).toBe(teacherIds.length);
      }
    });

    it('should avoid room conflicts', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get all periods for a specific day and period number
      const periodsInSlot = await prisma.timetablePeriod.findMany({
        where: { 
          branchId: testBranchId,
          dayOfWeek: 1, // Monday
          periodNumber: 1  // First period
        }
      });
      
      if (periodsInSlot.length > 0) {
        // Check no room is assigned to multiple sections at the same time
        const roomIds = periodsInSlot
          .filter(p => p.roomId)
          .map(p => p.roomId);
        const uniqueRoomIds = new Set(roomIds);
        
        expect(uniqueRoomIds.size).toBe(roomIds.length);
      }
    });
  });

  describe('Idempotency', () => {
    it('should not create duplicate periods on multiple runs', async () => {
      const context = await setupTestData();
      
      // First run
      const result1 = await seeder.seed(context);
      const count1 = await prisma.timetablePeriod.count({
        where: { branchId: testBranchId }
      });
      
      // Second run
      const result2 = await seeder.seed(context);
      const count2 = await prisma.timetablePeriod.count({
        where: { branchId: testBranchId }
      });
      
      // Should not create duplicates
      expect(count2).toBe(count1);
      expect(result2.metrics.totalRecords).toBe(0); // No new records created
    });
  });

  describe('Performance', () => {
    it('should efficiently create timetable periods', async () => {
      const context = await setupTestData();
      
      const startTime = Date.now();
      const result = await seeder.seed(context);
      const duration = Date.now() - startTime;
      
      console.log(`Created ${result.metrics.successCount} periods in ${duration}ms`);
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(10000); // 10 seconds
    });
  });
});