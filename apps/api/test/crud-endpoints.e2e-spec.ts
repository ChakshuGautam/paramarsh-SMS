import request = require('supertest');
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('CRUD Endpoints (E2E)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ 
      imports: [AppModule] 
    }).compile();
    
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    http = request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  // Helper function to test standard CRUD operations
  const testCrudEndpoints = (entityName: string, createData: any, updateData: any) => {
    describe(`${entityName} CRUD`, () => {
      let createdId: string;

      it(`should list ${entityName}`, async () => {
        const response = await http
          .get(`/api/v1/${entityName}`)
          .expect(200);
        
        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('total');
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it(`should create ${entityName}`, async () => {
        const response = await http
          .post(`/api/v1/${entityName}`)
          .send(createData)
          .expect(201);
        
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('id');
        createdId = response.body.data.id;
      });

      it(`should get single ${entityName}`, async () => {
        const response = await http
          .get(`/api/v1/${entityName}/${createdId}`)
          .expect(200);
        
        expect(response.body).toHaveProperty('data');
        expect(response.body.data.id).toBe(createdId);
      });

      it(`should update ${entityName}`, async () => {
        const response = await http
          .patch(`/api/v1/${entityName}/${createdId}`)
          .send(updateData)
          .expect(200);
        
        expect(response.body).toHaveProperty('data');
        expect(response.body.data.id).toBe(createdId);
      });

      it(`should delete ${entityName}`, async () => {
        await http
          .delete(`/api/v1/${entityName}/${createdId}`)
          .expect(200);
      });

      it(`should return 404 for deleted ${entityName}`, async () => {
        await http
          .get(`/api/v1/${entityName}/${createdId}`)
          .expect(404);
      });
    });
  };

  // Test Students
  testCrudEndpoints('students', {
    admissionNo: 'TEST001',
    firstName: 'Test',
    lastName: 'Student',
    dateOfBirth: '2010-01-01',
    gender: 'male',
    classId: '550e8400-e29b-41d4-a716-446655440000',
    sectionId: '550e8400-e29b-41d4-a716-446655440001'
  }, {
    firstName: 'Updated'
  });

  // Test Guardians
  testCrudEndpoints('guardians', {
    firstName: 'Test',
    lastName: 'Guardian',
    email: 'test@example.com',
    phoneNumber: '+919999999999',
    relationship: 'Father'
  }, {
    email: 'updated@example.com'
  });

  // Test Classes
  testCrudEndpoints('classes', {
    name: 'Test Class',
    gradeLevel: 1
  }, {
    name: 'Updated Class'
  });

  // Test Sections
  testCrudEndpoints('sections', {
    name: 'Test Section',
    classId: '550e8400-e29b-41d4-a716-446655440000',
    capacity: 30
  }, {
    capacity: 35
  });

  // Test Teachers
  testCrudEndpoints('teachers', {
    firstName: 'Test',
    lastName: 'Teacher',
    email: 'teacher@example.com',
    phoneNumber: '+919999999999',
    subject: 'Mathematics',
    qualifications: 'B.Ed'
  }, {
    subject: 'Physics'
  });

  // Test Enrollments
  testCrudEndpoints('enrollments', {
    studentId: '550e8400-e29b-41d4-a716-446655440000',
    sectionId: '550e8400-e29b-41d4-a716-446655440001',
    status: 'active',
    startDate: '2024-04-01'
  }, {
    status: 'inactive'
  });

  // Test FeeStructures
  testCrudEndpoints('feeStructures', {
    name: 'Test Fee Structure',
    description: 'Test description',
    classId: '550e8400-e29b-41d4-a716-446655440000',
    amount: 5000,
    frequency: 'monthly'
  }, {
    amount: 5500
  });

  // Test FeeSchedules
  testCrudEndpoints('feeSchedules', {
    name: 'Test Schedule',
    feeStructureId: '550e8400-e29b-41d4-a716-446655440000',
    dueDate: '2024-05-01',
    amount: 5000
  }, {
    amount: 5500
  });

  // Test Invoices
  testCrudEndpoints('invoices', {
    studentId: '550e8400-e29b-41d4-a716-446655440000',
    amount: 5000,
    dueDate: '2024-05-01',
    status: 'pending',
    period: 'May 2024'
  }, {
    status: 'paid'
  });

  // Test Staff
  testCrudEndpoints('staff', {
    firstName: 'Test',
    lastName: 'Staff',
    email: 'staff@example.com',
    phoneNumber: '+919999999999',
    designation: 'Clerk',
    department: 'Administration',
    status: 'active'
  }, {
    status: 'inactive'
  });

  // Test specific endpoint behaviors
  describe('Pagination and Filtering', () => {
    it('should support pagination parameters', async () => {
      const response = await http
        .get('/api/v1/students')
        .query({ page: 1, pageSize: 10 })
        .expect(200);
      
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });

    it('should support sorting', async () => {
      const response = await http
        .get('/api/v1/students')
        .query({ sort: 'firstName:asc' })
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
    });

    it('should support filtering', async () => {
      const response = await http
        .get('/api/v1/students')
        .query({ gender: 'male' })
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
    });

    it('should support search', async () => {
      const response = await http
        .get('/api/v1/students')
        .query({ q: 'Test' })
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
    });
  });

  // Test React Admin specific response format
  describe('React Admin Compatibility', () => {
    it('should return list response in React Admin format', async () => {
      const response = await http
        .get('/api/v1/students')
        .expect(200);
      
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(typeof response.body.total).toBe('number');
    });

    it('should return single item response in React Admin format', async () => {
      // First create an item
      const createResponse = await http
        .post('/api/v1/classes')
        .send({ name: 'Test Class for Format', gradeLevel: 5 })
        .expect(201);
      
      const id = createResponse.body.data.id;
      
      // Then get it
      const getResponse = await http
        .get(`/api/v1/classes/${id}`)
        .expect(200);
      
      expect(getResponse.body).toHaveProperty('data');
      expect(getResponse.body.data).toHaveProperty('id');
      
      // Clean up
      await http.delete(`/api/v1/classes/${id}`);
    });
  });

  // Test error handling
  describe('Error Handling', () => {
    it('should return 404 for non-existent resource', async () => {
      await http
        .get('/api/v1/students/non-existent-id')
        .expect(404);
    });

    it('should return 400 for invalid data', async () => {
      await http
        .post('/api/v1/students')
        .send({ invalid: 'data' })
        .expect(400);
    });

    it('should handle malformed IDs gracefully', async () => {
      await http
        .get('/api/v1/students/not-a-uuid')
        .expect(400);
    });
  });
});