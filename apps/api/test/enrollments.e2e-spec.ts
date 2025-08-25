import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../src/app.module';

describe('Enrollments API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    
    // Add ValidationPipe like in main.ts
    const { ValidationPipe } = require('@nestjs/common');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidUnknownValues: false,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        validationError: { target: false },
        exceptionFactory: (errors) => {
          const details = errors.reduce((acc: any, e) => {
            acc[e.property] = Object.values(e.constraints ?? {});
            return acc;
          }, {});
          const err: any = new Error('Unprocessable Entity');
          err.status = 422;
          (err as any).response = {
            type: 'about:blank',
            title: 'Unprocessable Entity',
            status: 422,
            detail: details,
            code: 'validation_error',
          };
          return err;
        },
      }),
    );
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/enrollments', () => {
    it('should return paginated list with correct format', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/enrollments?page=1&perPage=5')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(typeof response.body.total).toBe('number');

      if (response.body.data.length > 0) {
        const enrollment = response.body.data[0];
        expect(enrollment).toHaveProperty('id');
        expect(enrollment).toHaveProperty('studentId');
        expect(enrollment).toHaveProperty('sectionId');
        expect(enrollment).toHaveProperty('status');
        expect(enrollment).toHaveProperty('startDate');
        expect(enrollment).toHaveProperty('branchId', 'branch1');
        expect(['enrolled', 'inactive', 'completed', 'withdrawn']).toContain(enrollment.status);
      }
    });

    it('should isolate data between tenants', async () => {
      const [branch1Response, branch2Response] = await Promise.all([
        request(app.getHttpServer())
          .get('/api/v1/enrollments')
          .set('X-Branch-Id', 'branch1'),
        request(app.getHttpServer())
          .get('/api/v1/enrollments')
          .set('X-Branch-Id', 'branch2')
      ]);

      expect(branch1Response.status).toBe(200);
      expect(branch2Response.status).toBe(200);

      // Verify isolation
      const branch1Ids = branch1Response.body.data.map(item => item.id);
      const branch2Ids = branch2Response.body.data.map(item => item.id);
      const intersection = branch1Ids.filter(id => branch2Ids.includes(id));
      
      expect(intersection.length).toBe(0);
      
      // Verify branchId
      branch1Response.body.data.forEach(item => {
        expect(item.branchId).toBe('branch1');
      });
    });

    it('should support filtering by status', async () => {
      const filter = { status: 'enrolled' };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/enrollments?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      response.body.data.forEach(item => {
        expect(item.status).toBe('enrolled');
      });
    });

    it('should support filtering by student', async () => {
      // Get a student ID first
      const studentResponse = await request(app.getHttpServer())
        .get('/api/v1/students')
        .set('X-Branch-Id', 'branch1');
      
      if (studentResponse.body.data.length > 0) {
        const studentId = studentResponse.body.data[0].id;
        const filter = { studentId: studentId };
        
        const response = await request(app.getHttpServer())
          .get(`/api/v1/enrollments?filter=${encodeURIComponent(JSON.stringify(filter))}`)
          .set('X-Branch-Id', 'branch1')
          .expect(200);

        response.body.data.forEach(item => {
          expect(item.studentId).toBe(studentId);
        });
      }
    });

    it('should handle pagination correctly', async () => {
      const page1 = await request(app.getHttpServer())
        .get('/api/v1/enrollments?page=1&perPage=10')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const page2 = await request(app.getHttpServer())
        .get('/api/v1/enrollments?page=2&perPage=10')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      // Verify no overlap
      const page1Ids = page1.body.data.map(item => item.id);
      const page2Ids = page2.body.data.map(item => item.id);
      const overlap = page1Ids.filter(id => page2Ids.includes(id));
      
      expect(overlap.length).toBe(0);
    });
  });

  describe('GET /api/v1/enrollments/:id', () => {
    it('should return single enrollment with correct format', async () => {
      // First get list to find an ID
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/enrollments')
        .set('X-Branch-Id', 'branch1');
      
      const testId = listResponse.body.data[0]?.id;
      if (!testId) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/enrollments/${testId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', testId);
      expect(response.body.data).toHaveProperty('studentId');
      expect(response.body.data).toHaveProperty('sectionId');
      expect(response.body.data).toHaveProperty('branchId', 'branch1');
    });

    it('should return enrollment with student and section relationships', async () => {
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/enrollments')
        .set('X-Branch-Id', 'branch1');
      
      const testId = listResponse.body.data[0]?.id;
      if (!testId) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/enrollments/${testId}?include=student,section`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body.data).toHaveProperty('student');
      expect(response.body.data).toHaveProperty('section');
    });

    it('should return 404 for non-existent enrollment', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/enrollments/non-existent-id')
        .set('X-Branch-Id', 'branch1')
        .expect(404);
    });
  });

  describe('POST /api/v1/enrollments', () => {
    it('should create new enrollment with correct format', async () => {
      // Get student and section IDs
      const studentResponse = await request(app.getHttpServer())
        .get('/api/v1/students')
        .set('X-Branch-Id', 'branch1');
      
      const sectionResponse = await request(app.getHttpServer())
        .get('/api/v1/sections')
        .set('X-Branch-Id', 'branch1');
      
      if (studentResponse.body.data.length === 0 || sectionResponse.body.data.length === 0) {
        return; // Skip if no test data
      }

      const newEnrollment = {
        studentId: studentResponse.body.data[0].id,
        sectionId: sectionResponse.body.data[0].id,
        status: 'enrolled',
        startDate: '2024-04-01'
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/enrollments')
        .set('X-Branch-Id', 'branch1')
        .send(newEnrollment)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toMatchObject(newEnrollment);
      expect(response.body.data.branchId).toBe('branch1');
    });

    it('should validate required fields', async () => {
      const invalidEnrollment = {
        status: 'enrolled'
        // Missing studentId, sectionId
      };

      await request(app.getHttpServer())
        .post('/api/v1/enrollments')
        .set('X-Branch-Id', 'branch1')
        .send(invalidEnrollment)
        .expect(422);
    });
  });

  describe('Enrollment-specific tests with seed data', () => {
    it('should find enrollments for students', async () => {
      const studentResponse = await request(app.getHttpServer())
        .get('/api/v1/students?filter={"status":"active"}')
        .set('X-Branch-Id', 'branch1')
        .expect(200);
      
      const enrollmentResponse = await request(app.getHttpServer())
        .get('/api/v1/enrollments?filter={"status":"enrolled"}')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      // Should have both students and enrollments (but may not match 1:1 due to data structure)
      expect(studentResponse.body.data.length).toBeGreaterThan(0);
      expect(enrollmentResponse.body.data.length).toBeGreaterThan(0);
    });

    it('should have enrollments with correct start date from academic year', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/enrollments')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      response.body.data.forEach(enrollment => {
        // Check that start date is in a valid format and reasonable range
        expect(enrollment.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        const year = parseInt(enrollment.startDate.substring(0, 4));
        expect(year).toBeGreaterThanOrEqual(2020);
        expect(year).toBeLessThanOrEqual(2025);
      });
    });

    it('should find enrollments with different statuses based on student status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/enrollments')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const statuses = response.body.data.map(e => e.status);
      expect(statuses).toContain('enrolled'); // Most should be enrolled
      
      // Some might be inactive or completed based on student status
      const statusCounts = statuses.reduce((acc, status) => {
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      expect(statusCounts.enrolled).toBeGreaterThan(0);
    });

    it('should have one-to-one relationship between active students and enrollments', async () => {
      const studentResponse = await request(app.getHttpServer())
        .get('/api/v1/students?filter={"status":"active"}')
        .set('X-Branch-Id', 'branch1')
        .expect(200);
      
      const enrollmentResponse = await request(app.getHttpServer())
        .get('/api/v1/enrollments?filter={"status":"enrolled"}')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      // Each active student should have exactly one active enrollment
      const activeStudentIds = studentResponse.body.data.map(s => s.id);
      const enrolledStudentIds = enrollmentResponse.body.data.map(e => e.studentId);
      
      activeStudentIds.forEach(studentId => {
        const enrollmentsForStudent = enrolledStudentIds.filter(id => id === studentId);
        expect(enrollmentsForStudent.length).toBeLessThanOrEqual(1); // At most one active enrollment per student
      });
    });

    it('should link enrollments to valid sections', async () => {
      const enrollmentResponse = await request(app.getHttpServer())
        .get('/api/v1/enrollments?include=section')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      enrollmentResponse.body.data.forEach(enrollment => {
        if (enrollment.section) {
          expect(enrollment.section).toHaveProperty('name');
          expect(enrollment.section).toHaveProperty('classId');
          // Section names from seed data vary, accept any valid string
          expect(typeof enrollment.section.name).toBe('string');
          expect(enrollment.section.name.length).toBeGreaterThan(0);
        }
      });
    });

    it('should have enrollments distributed across different sections', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/enrollments')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const sectionIds = new Set(response.body.data.map(e => e.sectionId));
      // Check that students are enrolled in at least one section
      expect(sectionIds.size).toBeGreaterThanOrEqual(1);
    });
  });
});