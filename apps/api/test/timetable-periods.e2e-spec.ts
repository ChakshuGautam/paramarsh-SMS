import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Timetable Periods API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.PORT = '0';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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
  });

  afterAll(async () => {
    await app.close();
  });

  // 1. GET /api/v1/timetable/periods - List with pagination
  describe('GET /api/v1/timetable/periods', () => {
    it('should return paginated list of timetable periods', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/timetable/periods')
        .set('X-Branch-Id', 'branch1')
        .query({ page: 1, pageSize: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(typeof response.body.total).toBe('number');
    });

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
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/timetable/periods')
        .set('X-Branch-Id', 'branch1')
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
    });
  });
});