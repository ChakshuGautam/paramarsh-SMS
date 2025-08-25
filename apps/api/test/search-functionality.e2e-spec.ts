import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Search Functionality (e2e)', () => {
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

  describe('Students Search', () => {
    it('should search students by firstName using q parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/students?q=Raj')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const student = response.body.data[0];
        expect(student).toHaveProperty('firstName');
        expect(student.firstName.toLowerCase()).toContain('raj');
      }
    });

    it('should search students by lastName using q parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/students?q=Kumar')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const student = response.body.data[0];
        expect(student.lastName.toLowerCase()).toContain('kumar');
      }
    });

    it('should search students by admissionNo using q parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/students?q=2024001')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const student = response.body.data[0];
        expect(student.admissionNo).toContain('2024001');
      }
    });

    it('should return empty results for non-existent search term', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/students?q=NonExistentName12345')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });

    it('should support case-insensitive search', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/students?q=raj')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      if (response.body.data.length > 0) {
        const student = response.body.data[0];
        expect(student.firstName.toLowerCase()).toContain('raj');
      }
    });

    it('should support search with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/students?q=Kumar&page=1&perPage=2')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Teachers Search', () => {
    it('should search teachers by firstName using q parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/teachers?q=Ravi')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search teachers by subjects using q parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/teachers?q=Mathematics')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search teachers by qualifications using q parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/teachers?q=MSc')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Guardians Search', () => {
    it('should search guardians by name using q parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/guardians?q=Kumar')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search guardians by email using q parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/guardians?q=gmail.com')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search guardians by phone using q parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/guardians?q=9876')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Staff Search', () => {
    it('should search staff by firstName using q parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/hr/staff?q=Raj')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search staff by designation using q parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/hr/staff?q=Principal')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search staff by department using q parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/hr/staff?q=Administration')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Classes Search', () => {
    it('should search classes by name using q parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/classes?q=Class 10')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return correct response format for classes search', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/classes?q=Class')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      if (response.body.data.length > 0) {
        const classItem = response.body.data[0];
        expect(classItem).toHaveProperty('id');
        expect(classItem).toHaveProperty('name');
        expect(classItem).toHaveProperty('branchId');
      }
    });
  });

  describe('Sections Search', () => {
    it('should search sections by name using q parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/sections?q=A')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search sections by class name using q parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/sections?q=Class 10')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Applications Search', () => {
    it('should search applications by firstName using q parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admissions/applications?q=Raj')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search applications by applicationNo using q parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admissions/applications?q=APP2024')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search applications by guardianName using q parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admissions/applications?q=Kumar')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Invoices Search', () => {
    it('should search invoices by period using q parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/invoices?q=2024')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search invoices by status using q parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/invoices?q=paid')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search invoices by student details using q parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/invoices?q=Raj')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Payments Search', () => {
    it('should search payments by reference using q parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/payments?q=PAY2024')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search payments by gateway using q parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/payments?q=razorpay')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search payments by method using q parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/payments?q=upi')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Multi-tenancy Support in Search', () => {
    it('should filter search results by branchId', async () => {
      const branch1Response = await request(app.getHttpServer())
        .get('/api/v1/students?q=Raj')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const branch2Response = await request(app.getHttpServer())
        .get('/api/v1/students?q=Raj')
        .set('X-Branch-Id', 'branch2')
        .expect(200);

      expect(branch1Response.body).toHaveProperty('data');
      expect(branch2Response.body).toHaveProperty('data');
      
      // The results should be different for different branches
      if (branch1Response.body.data.length > 0 && branch2Response.body.data.length > 0) {
        expect(branch1Response.body.data[0].id).not.toBe(branch2Response.body.data[0].id);
      }
    });

    it('should respect branch isolation in teachers search', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/teachers?q=Mathematics')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      if (response.body.data.length > 0) {
        const teacher = response.body.data[0];
        expect(teacher).toHaveProperty('branchId');
        expect(teacher.branchId).toBe('branch1');
      }
    });
  });

  describe('Search with Filters and Sorting', () => {
    it('should support search combined with filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/students?q=Kumar&sort=firstName')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
    });

    it('should support search with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/guardians?q=gmail&page=1&perPage=5')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search query', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/students?q=')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
    });

    it('should handle special characters in search', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/students?q=%40gmail')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
    });

    it('should handle numeric search queries', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/invoices?q=2024')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
    });

    it('should handle very long search queries', async () => {
      const longQuery = 'a'.repeat(100);
      const response = await request(app.getHttpServer())
        .get(`/api/v1/students?q=${longQuery}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('Performance and Response Format', () => {
    it('should return consistent response format across all search endpoints', async () => {
      const endpoints = [
        '/api/v1/students',
        '/api/v1/teachers',
        '/api/v1/guardians',
        '/api/v1/hr/staff',
        '/api/v1/classes',
        '/api/v1/sections',
        '/api/v1/admissions/applications',
        '/api/v1/invoices',
        '/api/v1/payments'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app.getHttpServer())
          .get(`${endpoint}?q=test&page=1&perPage=1`)
          .set('X-Branch-Id', 'branch1')
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('total');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(typeof response.body.total).toBe('number');
      }
    });

    it('should respond within reasonable time for search queries', async () => {
      const startTime = Date.now();
      
      await request(app.getHttpServer())
        .get('/api/v1/students?q=Kumar')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Should respond within 2 seconds
      expect(responseTime).toBeLessThan(2000);
    });
  });
});