import { Test, TestingModule } from '@nestjs/testing';
<<<<<<< HEAD
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('TimetablePeriod E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
=======
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Timetable Periods API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.PORT = '0';
>>>>>>> origin/main
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
<<<<<<< HEAD
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Don't clear existing data - we now rely on seed data from the database
    // Tests will work with the seeded timetable periods
=======
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        validationError: { target: false },
      }),
    );
    await app.init();
>>>>>>> origin/main
  });

  afterAll(async () => {
    await app.close();
  });

<<<<<<< HEAD
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

=======
  // 1. GET /api/v1/timetable/periods - List with pagination
  describe('GET /api/v1/timetable/periods', () => {
    it('should return paginated list of timetable periods', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/timetable/periods')
        .set('X-Branch-Id', 'branch1')
        .query({ page: 1, pageSize: 10 });

      expect(response.status).toBe(200);
>>>>>>> origin/main
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(typeof response.body.total).toBe('number');
    });

<<<<<<< HEAD
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
=======
    it('should filter by branchId (multi-tenancy)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/timetable/periods')
        .set('X-Branch-Id', 'branch1')
        .query({ page: 1, pageSize: 10 });

      expect(response.status).toBe(200);
      // Verify all returned periods belong to branch1
      if (response.body.data.length > 0) {
        response.body.data.forEach((period: any) => {
          expect(period.branchId).toBe('branch1');
        });
      }
    });

    it('should support sorting', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/timetable/periods')
        .set('X-Branch-Id', 'branch1')
        .query({ page: 1, pageSize: 10, sort: 'dayOfWeek' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('should support filtering by sectionId', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/timetable/periods')
        .set('X-Branch-Id', 'branch1')
        .query({ page: 1, pageSize: 10, filter: JSON.stringify({ sectionId: 'section-1' }) });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('should support filtering by dayOfWeek', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/timetable/periods')
        .set('X-Branch-Id', 'branch1')
        .query({ page: 1, pageSize: 10, filter: JSON.stringify({ dayOfWeek: 1 }) });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });
  });

  // 2. GET /api/v1/timetable/periods/:id - Get single period
  describe('GET /api/v1/timetable/periods/:id', () => {
    it('should return single timetable period', async () => {
      // First get a list to find a valid ID
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/timetable/periods')
        .set('X-Branch-Id', 'branch1')
        .query({ page: 1, pageSize: 1 });

      if (listResponse.body.data.length > 0) {
        const periodId = listResponse.body.data[0].id;
        
        const response = await request(app.getHttpServer())
          .get(`/api/v1/timetable/periods/${periodId}`)
          .set('X-Branch-Id', 'branch1');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data.id).toBe(periodId);
        expect(response.body.data.branchId).toBe('branch1');
      }
    });

    it('should return 404 for non-existent period', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/timetable/periods/non-existent-id')
        .set('X-Branch-Id', 'branch1');

      expect(response.status).toBe(404);
    });
  });

  // 3. POST /api/v1/timetable/periods - Create period
  describe('POST /api/v1/timetable/periods', () => {
    const validPeriodData = {
      sectionId: 'section-1',
      dayOfWeek: 1, // Monday
      periodNumber: 1,
      startTime: '09:00',
      endTime: '10:00',
      subjectId: 'subject-1',
      teacherId: 'teacher-1',
      roomId: 'room-1',
      isBreak: false,
      academicYearId: 'academic-year-1',
    };

    it('should create a new timetable period', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/timetable/periods')
        .set('X-Branch-Id', 'branch1')
        .send(validPeriodData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.branchId).toBe('branch1');
      expect(response.body.data.sectionId).toBe(validPeriodData.sectionId);
      expect(response.body.data.dayOfWeek).toBe(validPeriodData.dayOfWeek);
      expect(response.body.data.periodNumber).toBe(validPeriodData.periodNumber);
    });

    it('should create a break period', async () => {
      const breakPeriodData = {
        ...validPeriodData,
        periodNumber: 3,
        startTime: '11:00',
        endTime: '11:15',
        isBreak: true,
        breakType: 'SHORT',
        subjectId: null, // No subject for break
        teacherId: null, // No teacher for break
>>>>>>> origin/main
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/timetable/periods')
        .set('X-Branch-Id', 'branch1')
<<<<<<< HEAD
        .send(newPeriod)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body).not.toHaveProperty('total');
      expect(typeof response.body.data).toBe('object');
=======
        .send(breakPeriodData);

      expect(response.status).toBe(201);
      expect(response.body.data.isBreak).toBe(true);
      expect(response.body.data.breakType).toBe('SHORT');
    });

    it('should validate required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/timetable/periods')
        .set('X-Branch-Id', 'branch1')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should validate dayOfWeek range (1-6)', async () => {
      const invalidData = {
        ...validPeriodData,
        dayOfWeek: 7, // Invalid - should be 1-6
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/timetable/periods')
        .set('X-Branch-Id', 'branch1')
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    it('should validate time format', async () => {
      const invalidData = {
        ...validPeriodData,
        startTime: 'invalid-time',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/timetable/periods')
        .set('X-Branch-Id', 'branch1')
        .send(invalidData);

      expect(response.status).toBe(400);
    });
  });

  // 4. PUT /api/v1/timetable/periods/:id - Update period
  describe('PUT /api/v1/timetable/periods/:id', () => {
    let createdPeriodId: string;

    beforeAll(async () => {
      // Create a period to update
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/timetable/periods')
        .set('X-Branch-Id', 'branch1')
        .send({
          sectionId: 'section-1',
          dayOfWeek: 2, // Tuesday
          periodNumber: 2,
          startTime: '10:00',
          endTime: '11:00',
          subjectId: 'subject-1',
          teacherId: 'teacher-1',
          roomId: 'room-1',
          isBreak: false,
          academicYearId: 'academic-year-1',
        });

      if (createResponse.status === 201) {
        createdPeriodId = createResponse.body.data.id;
      }
    });

    it('should update an existing timetable period', async () => {
      if (!createdPeriodId) {
        return; // Skip if creation failed
      }

      const updateData = {
        startTime: '10:15',
        endTime: '11:15',
        roomId: 'room-2',
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/timetable/periods/${createdPeriodId}`)
        .set('X-Branch-Id', 'branch1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(createdPeriodId);
      expect(response.body.data.startTime).toBe(updateData.startTime);
      expect(response.body.data.endTime).toBe(updateData.endTime);
      expect(response.body.data.roomId).toBe(updateData.roomId);
    });

    it('should return 404 for non-existent period', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/v1/timetable/periods/non-existent-id')
        .set('X-Branch-Id', 'branch1')
        .send({ startTime: '10:00' });

      expect(response.status).toBe(404);
    });

    it('should not allow updating to invalid dayOfWeek', async () => {
      if (!createdPeriodId) {
        return;
      }

      const response = await request(app.getHttpServer())
        .put(`/api/v1/timetable/periods/${createdPeriodId}`)
        .set('X-Branch-Id', 'branch1')
        .send({ dayOfWeek: 8 }); // Invalid

      expect(response.status).toBe(400);
    });
  });

  // 5. DELETE /api/v1/timetable/periods/:id - Delete period
  describe('DELETE /api/v1/timetable/periods/:id', () => {
    let periodToDeleteId: string;

    beforeEach(async () => {
      // Create a period to delete
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/timetable/periods')
        .set('X-Branch-Id', 'branch1')
        .send({
          sectionId: 'section-1',
          dayOfWeek: 3, // Wednesday
          periodNumber: 4,
          startTime: '14:00',
          endTime: '15:00',
          subjectId: 'subject-1',
          teacherId: 'teacher-1',
          roomId: 'room-1',
          isBreak: false,
          academicYearId: 'academic-year-1',
        });

      if (createResponse.status === 201) {
        periodToDeleteId = createResponse.body.data.id;
      }
    });

    it('should delete an existing timetable period', async () => {
      if (!periodToDeleteId) {
        return;
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/timetable/periods/${periodToDeleteId}`)
        .set('X-Branch-Id', 'branch1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(periodToDeleteId);

      // Verify the period is deleted
      const getResponse = await request(app.getHttpServer())
        .get(`/api/v1/timetable/periods/${periodToDeleteId}`)
        .set('X-Branch-Id', 'branch1');

      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent period', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/v1/timetable/periods/non-existent-id')
        .set('X-Branch-Id', 'branch1');

      expect(response.status).toBe(404);
    });
  });

  // 6. Multi-tenancy validation
  describe('Multi-tenancy', () => {
    let branch1PeriodId: string;

    beforeAll(async () => {
      // Create period in branch1
      const response = await request(app.getHttpServer())
        .post('/api/v1/timetable/periods')
        .set('X-Branch-Id', 'branch1')
        .send({
          sectionId: 'section-1',
          dayOfWeek: 4, // Thursday
          periodNumber: 1,
          startTime: '09:00',
          endTime: '10:00',
          subjectId: 'subject-1',
          teacherId: 'teacher-1',
          roomId: 'room-1',
          isBreak: false,
          academicYearId: 'academic-year-1',
        });

      if (response.status === 201) {
        branch1PeriodId = response.body.data.id;
      }
    });

    it('should not access periods from different branch', async () => {
      if (!branch1PeriodId) {
        return;
      }

      // Try to access branch1 period from branch2
      const response = await request(app.getHttpServer())
        .get(`/api/v1/timetable/periods/${branch1PeriodId}`)
        .set('X-Branch-Id', 'branch2');

      expect(response.status).toBe(404);
    });

    it('should not update periods from different branch', async () => {
      if (!branch1PeriodId) {
        return;
      }

      const response = await request(app.getHttpServer())
        .put(`/api/v1/timetable/periods/${branch1PeriodId}`)
        .set('X-Branch-Id', 'branch2')
        .send({ startTime: '09:15' });

      expect(response.status).toBe(404);
    });

    it('should not delete periods from different branch', async () => {
      if (!branch1PeriodId) {
        return;
      }

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/timetable/periods/${branch1PeriodId}`)
        .set('X-Branch-Id', 'branch2');

      expect(response.status).toBe(404);
    });
  });

  // Additional validation tests
  describe('Data validation', () => {
    it('should validate period structure', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/timetable/periods')
        .set('X-Branch-Id', 'branch1')
        .query({ page: 1, pageSize: 1 });

      expect(response.status).toBe(200);
      
      if (response.body.data.length > 0) {
        const period = response.body.data[0];
        expect(period).toHaveProperty('id');
        expect(period).toHaveProperty('branchId');
        expect(period).toHaveProperty('sectionId');
        expect(period).toHaveProperty('dayOfWeek');
        expect(period).toHaveProperty('periodNumber');
        expect(period).toHaveProperty('startTime');
        expect(period).toHaveProperty('endTime');
        expect(period).toHaveProperty('isBreak');
        expect(period).toHaveProperty('academicYearId');
        
        // Validate data types
        expect(typeof period.dayOfWeek).toBe('number');
        expect(typeof period.periodNumber).toBe('number');
        expect(typeof period.isBreak).toBe('boolean');
        expect(period.dayOfWeek).toBeGreaterThanOrEqual(1);
        expect(period.dayOfWeek).toBeLessThanOrEqual(6);
      }
>>>>>>> origin/main
    });
  });
});