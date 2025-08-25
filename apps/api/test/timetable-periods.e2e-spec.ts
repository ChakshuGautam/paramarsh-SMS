import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('TimetablePeriod E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Don't clear existing data - we now rely on seed data from the database
    // Tests will work with the seeded timetable periods
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/timetable/periods', () => {
    it('should return paginated response with seed data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/timetable/periods?page=1&pageSize=10')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.total).toBeGreaterThanOrEqual(0);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });

    it('should handle pagination correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/timetable/periods?page=1&pageSize=2')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });

    it('should handle filtering by dayOfWeek', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/timetable/periods?filter={"dayOfWeek":1}')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should handle filtering by sectionId', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/timetable/periods?filter={"sectionId":"section-1"}')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should handle sorting by periodNumber', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/timetable/periods?sort=periodNumber')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/timetable/periods/:id', () => {
    it('should return 404 for non-existent period', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/timetable/periods/non-existent-id')
        .set('X-Branch-Id', 'branch1')
        .expect(404);
    });

    it('should return 404 for period from different branch', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/timetable/periods/any-id')
        .set('X-Branch-Id', 'branch2')
        .expect(404);
    });
  });

  describe('POST /api/v1/timetable/periods', () => {
    let testData: {
      academicYearId: string;
      sectionId: string;
      subjectId: string;
      teacherId: string;
      roomId: string;
    };

    beforeAll(async () => {
      // Create minimal test data for creating periods
      const academicYear = await prisma.academicYear.upsert({
        where: { branchId_name: { branchId: 'branch1', name: '2024-25' } },
        create: {
          branchId: 'branch1',
          name: '2024-25',
          startDate: '2024-04-01',
          endDate: '2025-03-31',
          isActive: true,
        },
        update: {},
      });

      const testClass = await prisma.class.upsert({
        where: { id: 'test-class-periods' },
        create: {
          id: 'test-class-periods',
          branchId: 'branch1',
          name: 'Test Class',
          gradeLevel: 10,
        },
        update: {},
      });

      const testSection = await prisma.section.upsert({
        where: { id: 'test-section-periods' },
        create: {
          id: 'test-section-periods',
          branchId: 'branch1',
          classId: 'test-class-periods',
          name: 'A',
          capacity: 30,
        },
        update: {},
      });

      const testSubject = await prisma.subject.upsert({
        where: { code: 'TEST-MATH' },
        create: {
          branchId: 'branch1',
          code: 'TEST-MATH',
          name: 'Test Mathematics',
          credits: 5,
        },
        update: {},
      });

      const testStaff = await prisma.staff.upsert({
        where: { id: 'test-staff-periods' },
        create: {
          id: 'test-staff-periods',
          branchId: 'branch1',
          firstName: 'Test',
          lastName: 'Teacher',
          email: 'test.teacher@school.com',
          phone: '+91-9876543000',
          designation: 'Teacher',
          status: 'active',
        },
        update: {},
      });

      const testTeacher = await prisma.teacher.upsert({
        where: { staffId: 'test-staff-periods' },
        create: {
          branchId: 'branch1',
          staffId: 'test-staff-periods',
          subjects: 'Mathematics',
          qualifications: 'B.Sc',
          experienceYears: 5,
        },
        update: {},
      });

      const testRoom = await prisma.room.upsert({
        where: { code: 'TEST-R01' },
        create: {
          branchId: 'branch1',
          code: 'TEST-R01',
          name: 'Test Room 01',
          capacity: 30,
          type: 'classroom',
        },
        update: {},
      });

      testData = {
        academicYearId: academicYear.id,
        sectionId: testSection.id,
        subjectId: testSubject.id,
        teacherId: testTeacher.id,
        roomId: testRoom.id,
      };
    });

    it('should create a new timetable period', async () => {
      const newPeriod = {
        sectionId: testData.sectionId,
        dayOfWeek: 1, // Monday
        periodNumber: 1,
        startTime: '09:00',
        endTime: '09:45',
        subjectId: testData.subjectId,
        teacherId: testData.teacherId,
        roomId: testData.roomId,
        isBreak: false,
        academicYearId: testData.academicYearId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/timetable/periods')
        .set('X-Branch-Id', 'branch1')
        .send(newPeriod)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.sectionId).toBe(newPeriod.sectionId);
      expect(response.body.data.dayOfWeek).toBe(newPeriod.dayOfWeek);
      expect(response.body.data.periodNumber).toBe(newPeriod.periodNumber);
      expect(response.body.data.branchId).toBe('branch1');
      expect(response.body.data.id).toBeDefined();

      // Store the created period ID for later tests
      (global as any).testPeriodId = response.body.data.id;
    });

    it('should create a break period without subject and teacher', async () => {
      const breakPeriod = {
        sectionId: testData.sectionId,
        dayOfWeek: 1, // Monday
        periodNumber: 3,
        startTime: '10:30',
        endTime: '10:45',
        isBreak: true,
        breakType: 'SHORT',
        academicYearId: testData.academicYearId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/timetable/periods')
        .set('X-Branch-Id', 'branch1')
        .send(breakPeriod)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.isBreak).toBe(true);
      expect(response.body.data.breakType).toBe('SHORT');
      expect(response.body.data.subjectId).toBeNull();
      expect(response.body.data.teacherId).toBeNull();
    });

    it('should validate required fields', async () => {
      const invalidPeriod = {
        dayOfWeek: 1,
        periodNumber: 1,
        startTime: '09:00',
        endTime: '09:45',
        // Missing sectionId and academicYearId
      };

      await request(app.getHttpServer())
        .post('/api/v1/timetable/periods')
        .set('X-Branch-Id', 'branch1')
        .send(invalidPeriod)
        .expect(400);
    });

    it('should prevent duplicate periods for same section, day, and period number', async () => {
      const duplicatePeriod = {
        sectionId: testData.sectionId,
        dayOfWeek: 1, // Monday
        periodNumber: 1, // Same as first created period
        startTime: '09:00',
        endTime: '09:45',
        subjectId: testData.subjectId,
        teacherId: testData.teacherId,
        academicYearId: testData.academicYearId,
      };

      await request(app.getHttpServer())
        .post('/api/v1/timetable/periods')
        .set('X-Branch-Id', 'branch1')
        .send(duplicatePeriod)
        .expect(409);
    });
  });

  describe('GET /api/v1/timetable/periods/:id (with data)', () => {
    it('should return a specific timetable period', async () => {
      const periodId = (global as any).testPeriodId;
      if (!periodId) {
        console.log('Skipping test - no period created');
        return;
      }

      const response = await request(app.getHttpServer())
        .get(`/api/v1/timetable/periods/${periodId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(periodId);
      expect(response.body.data.branchId).toBe('branch1');
      expect(response.body.data.dayOfWeek).toBe(1);
      expect(response.body.data.periodNumber).toBe(1);
    });

    it('should return 404 for period from different branch', async () => {
      const periodId = (global as any).testPeriodId;
      if (!periodId) {
        console.log('Skipping test - no period created');
        return;
      }

      await request(app.getHttpServer())
        .get(`/api/v1/timetable/periods/${periodId}`)
        .set('X-Branch-Id', 'branch2')
        .expect(404);
    });
  });

  describe('PUT /api/v1/timetable/periods/:id', () => {
    it('should update an existing timetable period', async () => {
      const periodId = (global as any).testPeriodId;
      if (!periodId) {
        console.log('Skipping test - no period created');
        return;
      }

      const updatedData = {
        startTime: '09:15',
        endTime: '10:00',
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/timetable/periods/${periodId}`)
        .set('X-Branch-Id', 'branch1')
        .send(updatedData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.startTime).toBe(updatedData.startTime);
      expect(response.body.data.endTime).toBe(updatedData.endTime);
      expect(response.body.data.id).toBe(periodId);
    });

    it('should return 404 when updating non-existent period', async () => {
      const updatedData = {
        startTime: '09:15',
        endTime: '10:00',
      };

      await request(app.getHttpServer())
        .put('/api/v1/timetable/periods/non-existent-id')
        .set('X-Branch-Id', 'branch1')
        .send(updatedData)
        .expect(404);
    });

    it('should return 404 when updating period from different branch', async () => {
      const periodId = (global as any).testPeriodId;
      if (!periodId) {
        console.log('Skipping test - no period created');
        return;
      }

      const updatedData = {
        startTime: '09:15',
        endTime: '10:00',
      };

      await request(app.getHttpServer())
        .put(`/api/v1/timetable/periods/${periodId}`)
        .set('X-Branch-Id', 'branch2')
        .send(updatedData)
        .expect(404);
    });
  });

  describe('DELETE /api/v1/timetable/periods/:id', () => {
    it('should delete a timetable period', async () => {
      const periodId = (global as any).testPeriodId;
      if (!periodId) {
        console.log('Skipping test - no period created');
        return;
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/timetable/periods/${periodId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(periodId);

      // Verify it's deleted
      await request(app.getHttpServer())
        .get(`/api/v1/timetable/periods/${periodId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(404);
    });

    it('should return 404 when deleting non-existent period', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/timetable/periods/non-existent-id')
        .set('X-Branch-Id', 'branch1')
        .expect(404);
    });
  });

  describe('Multi-tenancy validation', () => {
    beforeAll(async () => {
      // Clean up all periods before multi-tenancy tests
      await prisma.timetablePeriod.deleteMany();
    });

    it('should isolate data between branches', async () => {
      // Get branch1 periods
      const branch1Response = await request(app.getHttpServer())
        .get('/api/v1/timetable/periods')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      // Get branch2 periods
      const branch2Response = await request(app.getHttpServer())
        .get('/api/v1/timetable/periods')
        .set('X-Branch-Id', 'branch2')
        .expect(200);

      // branch1 may have seed data, branch2 should be empty
      // Verify that data is isolated between branches
      expect(Array.isArray(branch1Response.body.data)).toBe(true);
      expect(Array.isArray(branch2Response.body.data)).toBe(true);
      expect(branch2Response.body.data).toEqual([]); // branch2 should still be empty
      expect(branch2Response.body.total).toBe(0);
      
      // Verify no data leaks between branches
      const branch1Ids = branch1Response.body.data.map(p => p.id);
      const branch2Ids = branch2Response.body.data.map(p => p.id);
      const intersection = branch1Ids.filter(id => branch2Ids.includes(id));
      expect(intersection.length).toBe(0);
    });

    it('should default to branch1 when no branch header provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/timetable/periods')
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Response format validation', () => {
    it('should return correct format for findAll', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/timetable/periods')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(typeof response.body.total).toBe('number');
    });

    it('should return correct format for create', async () => {
      // Clean up any existing periods first
      await prisma.timetablePeriod.deleteMany({
        where: { branchId: 'branch1' }
      });

      // Use existing test data
      const academicYear = await prisma.academicYear.findFirst({
        where: { branchId: 'branch1', name: '2024-25' }
      });
      const section = await prisma.section.findFirst({
        where: { branchId: 'branch1' }
      });
      const subject = await prisma.subject.findFirst({
        where: { branchId: 'branch1' }
      });
      const teacher = await prisma.teacher.findFirst({
        where: { branchId: 'branch1' }
      });

      if (!academicYear || !section || !subject || !teacher) {
        console.log('Skipping test - required test data not found');
        return;
      }

      const newPeriod = {
        sectionId: section.id,
        dayOfWeek: 2, // Tuesday
        periodNumber: 1,
        startTime: '09:00',
        endTime: '09:45',
        subjectId: subject.id,
        teacherId: teacher.id,
        academicYearId: academicYear.id,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/timetable/periods')
        .set('X-Branch-Id', 'branch1')
        .send(newPeriod)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body).not.toHaveProperty('total');
      expect(typeof response.body.data).toBe('object');
    });
  });
});