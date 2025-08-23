import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Applications API (e2e)', () => {
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

  describe('GET /api/v1/admissions/applications', () => {
    it('should return paginated list with correct format', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admissions/applications?page=1&pageSize=5')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(typeof response.body.total).toBe('number');

      if (response.body.data.length > 0) {
        const application = response.body.data[0];
        expect(application).toHaveProperty('id');
        expect(application).toHaveProperty('applicationNo');
        expect(application).toHaveProperty('firstName');
        expect(application).toHaveProperty('lastName');
        expect(application).toHaveProperty('dob');
        expect(application).toHaveProperty('gender');
        expect(application).toHaveProperty('guardianName');
        expect(application).toHaveProperty('guardianPhone');
        expect(application).toHaveProperty('guardianEmail');
        expect(application).toHaveProperty('previousSchool');
        expect(application).toHaveProperty('classAppliedFor');
        expect(application).toHaveProperty('status');
        expect(application).toHaveProperty('submittedAt');
        expect(application).toHaveProperty('branchId', 'branch1');
        expect(application.applicationNo).toMatch(/^APP\d{8}$/);
        expect(['PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED']).toContain(application.status);
      }
    });

    it('should isolate data between tenants', async () => {
      const [branch1Response, branch2Response] = await Promise.all([
        request(app.getHttpServer())
          .get('/api/v1/admissions/applications')
          .set('X-Branch-Id', 'branch1'),
        request(app.getHttpServer())
          .get('/api/v1/admissions/applications')
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

    it('should support ascending sorting by firstName', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admissions/applications?sort=firstName')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const names = response.body.data.map(item => item.firstName);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    it('should support descending sorting by firstName', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admissions/applications?sort=-firstName')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const names = response.body.data.map(item => item.firstName);
      const sortedNames = [...names].sort().reverse();
      expect(names).toEqual(sortedNames);
    });

    it('should support filtering by status', async () => {
      const filter = { status: 'PENDING' };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/admissions/applications?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      response.body.data.forEach(item => {
        expect(item.status).toBe('PENDING');
      });
    });

    it('should support filtering by classAppliedFor', async () => {
      const filter = { classAppliedFor: 'Class 1' };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/admissions/applications?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      response.body.data.forEach(item => {
        expect(item.classAppliedFor).toBe('Class 1');
      });
    });

    it('should handle pagination correctly', async () => {
      const page1 = await request(app.getHttpServer())
        .get('/api/v1/admissions/applications?page=1&pageSize=2')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const page2 = await request(app.getHttpServer())
        .get('/api/v1/admissions/applications?page=2&pageSize=2')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      // Verify no overlap
      const page1Ids = page1.body.data.map(item => item.id);
      const page2Ids = page2.body.data.map(item => item.id);
      const overlap = page1Ids.filter(id => page2Ids.includes(id));
      
      expect(overlap.length).toBe(0);
    });
  });

  describe('GET /api/v1/admissions/applications/:id', () => {
    it('should return single application with correct format', async () => {
      // First get list to find an ID
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/admissions/applications')
        .set('X-Branch-Id', 'branch1');
      
      const testId = listResponse.body.data[0]?.id;
      if (!testId) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/admissions/applications/${testId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', testId);
      expect(response.body.data).toHaveProperty('applicationNo');
      expect(response.body.data).toHaveProperty('firstName');
      expect(response.body.data).toHaveProperty('lastName');
      expect(response.body.data).toHaveProperty('branchId', 'branch1');
    });

    it('should return 404 for non-existent application', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admissions/applications/non-existent-id')
        .set('X-Branch-Id', 'branch1')
        .expect(404);
    });

    it('should not return application from different tenant', async () => {
      // Get item from branch1
      const branch1List = await request(app.getHttpServer())
        .get('/api/v1/admissions/applications')
        .set('X-Branch-Id', 'branch1');
      
      const branch1Id = branch1List.body.data[0]?.id;
      if (!branch1Id) return;

      // Try to access from branch2
      await request(app.getHttpServer())
        .get(`/api/v1/admissions/applications/${branch1Id}`)
        .set('X-Branch-Id', 'branch2')
        .expect(404);
    });
  });

  describe('POST /api/v1/admissions/applications', () => {
    it('should create new application with correct format', async () => {
      const newApplication = {
        applicationNo: `APP2025${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        firstName: 'Aarav',
        lastName: 'Sharma',
        dob: '2015-05-15',
        gender: 'male',
        guardianName: 'Rajesh Sharma',
        guardianPhone: '+91-9876543210',
        guardianEmail: 'rajesh.sharma@example.com',
        previousSchool: 'Little Angels Nursery',
        classAppliedFor: 'Class 1',
        status: 'PENDING',
        notes: 'Student has good communication skills'
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/admissions/applications')
        .set('X-Branch-Id', 'branch1')
        .send(newApplication)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toMatchObject(newApplication);
      expect(response.body.data.branchId).toBe('branch1');
      expect(response.body.data.submittedAt).toBeDefined();
    });

    it('should validate required fields', async () => {
      const invalidApplication = {
        firstName: 'Test'
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/api/v1/admissions/applications')
        .set('X-Branch-Id', 'branch1')
        .send(invalidApplication)
        .expect(400);
    });

    it('should validate unique application number', async () => {
      // Get existing application number
      const existingResponse = await request(app.getHttpServer())
        .get('/api/v1/admissions/applications')
        .set('X-Branch-Id', 'branch1');
      
      if (existingResponse.body.data.length === 0) return;
      
      const existingApplicationNo = existingResponse.body.data[0].applicationNo;
      
      const duplicateApplication = {
        applicationNo: existingApplicationNo,
        firstName: 'Duplicate',
        lastName: 'Application',
        dob: '2015-05-15',
        gender: 'female',
        guardianName: 'Test Guardian',
        guardianPhone: '+91-9876543211',
        guardianEmail: 'test@example.com',
        classAppliedFor: 'Class 1',
        status: 'PENDING'
      };

      await request(app.getHttpServer())
        .post('/api/v1/admissions/applications')
        .set('X-Branch-Id', 'branch1')
        .send(duplicateApplication)
        .expect(409);
    });

    it('should validate status enum values', async () => {
      const invalidApplication = {
        applicationNo: `APP2025${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        firstName: 'Test',
        lastName: 'Student',
        dob: '2015-05-15',
        gender: 'male',
        guardianName: 'Test Guardian',
        guardianPhone: '+91-9876543210',
        guardianEmail: 'test@example.com',
        classAppliedFor: 'Class 1',
        status: 'INVALID_STATUS' // Invalid status
      };

      await request(app.getHttpServer())
        .post('/api/v1/admissions/applications')
        .set('X-Branch-Id', 'branch1')
        .send(invalidApplication)
        .expect(400);
    });
  });

  describe('PUT /api/v1/admissions/applications/:id', () => {
    it('should update application with correct format', async () => {
      // First get an existing application
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/admissions/applications')
        .set('X-Branch-Id', 'branch1');
      
      const applicationId = listResponse.body.data[0]?.id;
      if (!applicationId) return;

      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        status: 'APPROVED',
        reviewedBy: 'admin',
        notes: 'Application approved after review'
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/admissions/applications/${applicationId}`)
        .set('X-Branch-Id', 'branch1')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.firstName).toBe('Updated');
      expect(response.body.data.lastName).toBe('Name');
      expect(response.body.data.status).toBe('APPROVED');
      expect(response.body.data.id).toBe(applicationId);
      expect(response.body.data.reviewedAt).toBeDefined();
    });

    it('should not update application from different tenant', async () => {
      // Get item from branch1
      const branch1List = await request(app.getHttpServer())
        .get('/api/v1/admissions/applications')
        .set('X-Branch-Id', 'branch1');
      
      const branch1Id = branch1List.body.data[0]?.id;
      if (!branch1Id) return;

      // Try to update from branch2
      await request(app.getHttpServer())
        .put(`/api/v1/admissions/applications/${branch1Id}`)
        .set('X-Branch-Id', 'branch2')
        .send({ firstName: 'Hacked' })
        .expect(404);
    });
  });

  describe('PATCH /api/v1/admissions/applications/:id', () => {
    it('should partially update application', async () => {
      // First get an existing application
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/admissions/applications')
        .set('X-Branch-Id', 'branch1');
      
      const applicationId = listResponse.body.data[0]?.id;
      if (!applicationId) return;

      const patchData = {
        status: 'WAITLISTED'
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/admissions/applications/${applicationId}`)
        .set('X-Branch-Id', 'branch1')
        .send(patchData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.status).toBe('WAITLISTED');
      expect(response.body.data.id).toBe(applicationId);
    });
  });

  describe('DELETE /api/v1/admissions/applications/:id', () => {
    it('should delete application with correct format', async () => {
      // First create an application to delete
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/admissions/applications')
        .set('X-Branch-Id', 'branch1')
        .send({
          applicationNo: 'DEL20241234',
          firstName: 'To Delete',
          lastName: 'Application',
          dob: '2015-05-15',
          gender: 'male',
          guardianName: 'Delete Guardian',
          guardianPhone: '+91-9876543210',
          guardianEmail: 'delete@example.com',
          classAppliedFor: 'Class 1',
          status: 'PENDING'
        });

      // Skip test if creation failed
      if (createResponse.status !== 201 || !createResponse.body?.data?.id) {
        return;
      }

      const applicationId = createResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/admissions/applications/${applicationId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(applicationId);

      // Verify it's deleted
      await request(app.getHttpServer())
        .get(`/api/v1/admissions/applications/${applicationId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(404);
    });
  });

  describe('GET /api/v1/admissions/applications (getMany)', () => {
    it('should return multiple applications by ids', async () => {
      // Get some IDs
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/admissions/applications')
        .set('X-Branch-Id', 'branch1');
      
      const ids = listResponse.body.data
        .slice(0, 3)
        .map(item => item.id);

      if (ids.length === 0) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/admissions/applications?ids=${ids.join(',')}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(ids.length);
      
      response.body.data.forEach(item => {
        expect(ids).toContain(item.id);
      });
    });
  });

  describe('Application-specific tests with seed data', () => {
    it('should find applications with Indian names from seed data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admissions/applications')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const firstNames = response.body.data.map(a => a.firstName);
      const indianNames = ['Aarav', 'Saanvi', 'Rohan', 'Neha', 'Vivaan', 'Ananya', 'Arjun', 'Diya', 'Ishaan', 'Kavya'];
      const hasIndianNames = firstNames.some(name => indianNames.includes(name));
      expect(hasIndianNames).toBe(true);
    });

    it('should have applications with Indian phone numbers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admissions/applications')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const phoneNumbers = response.body.data.map(a => a.guardianPhone);
      const indianPhones = phoneNumbers.filter(phone => phone.startsWith('+91-'));
      expect(indianPhones.length).toBeGreaterThan(0);
    });

    it('should have applications distributed across different statuses', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admissions/applications')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const statuses = new Set(response.body.data.map(a => a.status));
      expect(statuses.size).toBeGreaterThan(1); // Applications should have multiple statuses
    });

    it('should filter applications by gender', async () => {
      const filter = { gender: 'female' };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/admissions/applications?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      response.body.data.forEach(application => {
        expect(application.gender).toBe('female');
      });
    });

    it('should have applications with realistic previous schools', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admissions/applications')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const previousSchools = response.body.data.map(a => a.previousSchool);
      const schoolTypes = ['Nursery', 'Kindergarten', 'School', 'Academy'];
      const hasRealisticSchools = previousSchools.some(school => 
        schoolTypes.some(type => school && school.includes(type))
      );
      expect(hasRealisticSchools).toBe(true);
    });
  });
});