import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Students API (e2e)', () => {
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

  describe('GET /api/v1/students', () => {
    it('should return paginated list with correct format', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/students?page=1&perPage=5')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(typeof response.body.total).toBe('number');

      if (response.body.data.length > 0) {
        const student = response.body.data[0];
        expect(student).toHaveProperty('id');
        expect(student).toHaveProperty('admissionNo');
        expect(student).toHaveProperty('firstName');
        expect(student).toHaveProperty('lastName');
        // API returns branchId
        expect(student).toHaveProperty('branchId', 'branch1');
        expect(student.admissionNo).toMatch(/^ADM\d{8}$/);
      }
    });

    it('should isolate data between tenants', async () => {
      const [branch1Response, branch2Response] = await Promise.all([
        request(app.getHttpServer())
          .get('/api/v1/students')
          .set('X-Branch-Id', 'branch1'),
        request(app.getHttpServer())
          .get('/api/v1/students')
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
        .get('/api/v1/students?sort=firstName')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const names = response.body.data.map(item => item.firstName);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    it('should support descending sorting by firstName', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/students?sort=-firstName')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const names = response.body.data.map(item => item.firstName);
      const sortedNames = [...names].sort().reverse();
      expect(names).toEqual(sortedNames);
    });

    it('should support filtering by status', async () => {
      const filter = { status: 'active' };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/students?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      response.body.data.forEach(item => {
        expect(item.status).toBe('active');
      });
    });

    it('should support filtering by class', async () => {
      // First get a class ID
      const classResponse = await request(app.getHttpServer())
        .get('/api/v1/classes')
        .set('X-Branch-Id', 'branch1');
      
      if (classResponse.body.data.length > 0) {
        const classId = classResponse.body.data[0].id;
        const filter = { classId: classId };
        
        const response = await request(app.getHttpServer())
          .get(`/api/v1/students?filter=${encodeURIComponent(JSON.stringify(filter))}`)
          .set('X-Branch-Id', 'branch1')
          .expect(200);

        response.body.data.forEach(item => {
          expect(item.classId).toBe(classId);
        });
      }
    });

    it('should handle pagination correctly', async () => {
      const page1 = await request(app.getHttpServer())
        .get('/api/v1/students?page=1&perPage=2')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const page2 = await request(app.getHttpServer())
        .get('/api/v1/students?page=2&perPage=2')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      // Verify no overlap
      const page1Ids = page1.body.data.map(item => item.id);
      const page2Ids = page2.body.data.map(item => item.id);
      const overlap = page1Ids.filter(id => page2Ids.includes(id));
      
      expect(overlap.length).toBe(0);
    });
  });

  describe('GET /api/v1/students/:id', () => {
    it('should return single student with correct format', async () => {
      // First get list to find an ID
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/students')
        .set('X-Branch-Id', 'branch1');
      
      const testId = listResponse.body.data[0]?.id;
      if (!testId) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/students/${testId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', testId);
      expect(response.body.data).toHaveProperty('admissionNo');
      expect(response.body.data).toHaveProperty('firstName');
      expect(response.body.data).toHaveProperty('branchId', 'branch1');
    });

    it('should return 404 for non-existent student', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/students/non-existent-id')
        .set('X-Branch-Id', 'branch1')
        .expect(404);
    });

    it('should not return student from different tenant', async () => {
      // Get item from branch1
      const branch1List = await request(app.getHttpServer())
        .get('/api/v1/students')
        .set('X-Branch-Id', 'branch1');
      
      const branch1Id = branch1List.body.data[0]?.id;
      if (!branch1Id) return;

      // Try to access from branch2
      await request(app.getHttpServer())
        .get(`/api/v1/students/${branch1Id}`)
        .set('X-Branch-Id', 'branch2')
        .expect(404);
    });
  });

  describe('POST /api/v1/students', () => {
    it('should create new student with correct format', async () => {
      // Get class and section IDs first
      const classResponse = await request(app.getHttpServer())
        .get('/api/v1/classes')
        .set('X-Branch-Id', 'branch1');
      
      const sectionResponse = await request(app.getHttpServer())
        .get('/api/v1/sections')
        .set('X-Branch-Id', 'branch1');
      
      if (classResponse.body.data.length === 0 || sectionResponse.body.data.length === 0) {
        return; // Skip if no test data
      }

      const newStudent = {
        admissionNo: `ADM2025${Date.now()}${Math.floor(Math.random() * 10000)}`,
        firstName: 'Test',
        lastName: 'Student',
        dob: '2010-05-15',
        gender: 'male',
        classId: classResponse.body.data[0].id,
        sectionId: sectionResponse.body.data[0].id,
        rollNumber: '999',
        status: 'active'
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/students')
        .set('X-Branch-Id', 'branch1')
        .send(newStudent)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toMatchObject(newStudent);
      expect(response.body.data.branchId).toBe('branch1');
    });

    it('should validate required fields', async () => {
      const invalidStudent = {
        firstName: 'Test'
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/api/v1/students')
        .set('X-Branch-Id', 'branch1')
        .send(invalidStudent)
        .expect(400);
    });

    it('should validate unique admission number', async () => {
      // Get existing student admission number
      const existingResponse = await request(app.getHttpServer())
        .get('/api/v1/students')
        .set('X-Branch-Id', 'branch1');
      
      if (existingResponse.body.data.length === 0) return;
      
      const existingAdmissionNo = existingResponse.body.data[0].admissionNo;
      
      const duplicateStudent = {
        admissionNo: existingAdmissionNo,
        firstName: 'Duplicate',
        lastName: 'Student',
        dob: '2010-05-15',
        gender: 'female',
        rollNumber: '998',
        status: 'active'
      };

      await request(app.getHttpServer())
        .post('/api/v1/students')
        .set('X-Branch-Id', 'branch1')
        .send(duplicateStudent)
        .expect(409);
    });
  });

  describe('PUT /api/v1/students/:id', () => {
    it('should update student with correct format', async () => {
      // First get an existing student
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/students')
        .set('X-Branch-Id', 'branch1');
      
      const studentId = listResponse.body.data[0]?.id;
      if (!studentId) return;

      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        status: 'active'
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/students/${studentId}`)
        .set('X-Branch-Id', 'branch1')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.firstName).toBe('Updated');
      expect(response.body.data.lastName).toBe('Name');
      expect(response.body.data.id).toBe(studentId);
    });

    it('should not update student from different tenant', async () => {
      // Get item from branch1
      const branch1List = await request(app.getHttpServer())
        .get('/api/v1/students')
        .set('X-Branch-Id', 'branch1');
      
      const branch1Id = branch1List.body.data[0]?.id;
      if (!branch1Id) return;

      // Try to update from branch2
      await request(app.getHttpServer())
        .put(`/api/v1/students/${branch1Id}`)
        .set('X-Branch-Id', 'branch2')
        .send({ firstName: 'Hacked' })
        .expect(404);
    });
  });

  describe('PATCH /api/v1/students/:id', () => {
    it('should partially update student', async () => {
      // First get an existing student
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/students')
        .set('X-Branch-Id', 'branch1');
      
      const studentId = listResponse.body.data[0]?.id;
      if (!studentId) return;

      const patchData = {
        status: 'inactive'
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/students/${studentId}`)
        .set('X-Branch-Id', 'branch1')
        .send(patchData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.status).toBe('inactive');
      expect(response.body.data.id).toBe(studentId);
    });
  });

  describe('DELETE /api/v1/students/:id', () => {
    it('should delete student with correct format', async () => {
      // First create a student to delete
      const classResponse = await request(app.getHttpServer())
        .get('/api/v1/classes')
        .set('X-Branch-Id', 'branch1');
      
      const sectionResponse = await request(app.getHttpServer())
        .get('/api/v1/sections')
        .set('X-Branch-Id', 'branch1');
      
      if (classResponse.body.data.length === 0 || sectionResponse.body.data.length === 0) {
        return; // Skip if no test data
      }

      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/students')
        .set('X-Branch-Id', 'branch1')
        .send({
          admissionNo: 'DEL20241234',
          firstName: 'To Delete',
          lastName: 'Student',
          dob: '2010-05-15',
          gender: 'male',
          classId: classResponse.body.data[0].id,
          sectionId: sectionResponse.body.data[0].id,
          rollNumber: '997',
          status: 'active'
        });

      // Skip test if creation failed
      if (createResponse.status !== 201 || !createResponse.body?.data?.id) {
        return;
      }

      const studentId = createResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/students/${studentId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(studentId);

      // Verify it's deleted
      await request(app.getHttpServer())
        .get(`/api/v1/students/${studentId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(404);
    });
  });

  describe('GET /api/v1/students (getMany)', () => {
    it('should return multiple students by ids', async () => {
      // Get some IDs
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/students')
        .set('X-Branch-Id', 'branch1');
      
      const ids = listResponse.body.data
        .slice(0, 3)
        .map(item => item.id);

      if (ids.length === 0) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/students?ids=${ids.join(',')}`)
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

  describe('Student-specific tests with seed data', () => {
    it('should find students with specific admission numbers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/students')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const admissionNumbers = response.body.data.map(s => s.admissionNo);
      expect(admissionNumbers.some(num => num.startsWith('ADM2025'))).toBe(true);
    });

    it('should find students with Indian names from seed data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/students')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const firstNames = response.body.data.map(s => s.firstName);
      const indianNames = ['Aarav', 'Saanvi', 'Rohan', 'Neha', 'Vivaan', 'Ananya'];
      const hasIndianNames = firstNames.some(name => indianNames.includes(name));
      expect(hasIndianNames).toBe(true);
    });

    it('should have students distributed across different classes', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/students')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const classIds = new Set(response.body.data.map(s => s.classId));
      expect(classIds.size).toBeGreaterThan(1); // Students should be in multiple classes
    });

    it('should filter students by gender', async () => {
      const filter = { gender: 'male' };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/students?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      response.body.data.forEach(student => {
        expect(student.gender).toBe('male');
      });
    });
  });
<<<<<<< HEAD

  describe('Query Parameter Issues (TDD Reproduction)', () => {
    it('should handle search query (q) parameter correctly', async () => {
      // First get some student data to search for
      const allStudents = await request(app.getHttpServer())
        .get('/api/v1/students')
        .set('X-Branch-Id', 'branch1');
      
      if (allStudents.body.data.length === 0) return;

      const firstStudent = allStudents.body.data[0];
      const searchTerm = firstStudent.firstName.substring(0, 2); // Use first 2 chars

      const response = await request(app.getHttpServer())
        .get(`/api/v1/students?q=${searchTerm}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.total).toBeGreaterThan(0);

      // Verify that returned students match the search
      response.body.data.forEach(student => {
        const matchesFirstName = student.firstName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLastName = student.lastName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAdmissionNo = student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());
        
        expect(matchesFirstName || matchesLastName || matchesAdmissionNo).toBe(true);
      });
    });

    it('should handle status filtering with status=active', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/students?status=active')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);

      // All returned students should have status 'active'
      response.body.data.forEach(student => {
        expect(student.status).toBe('active');
      });
    });

    it('should handle composite branch ID (dps-main)', async () => {
      // First, let's see if we have any data for this composite branch
      const response = await request(app.getHttpServer())
        .get('/api/v1/students')
        .set('X-Branch-Id', 'dps-main')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);

      // All returned students should have branchId 'dps-main'
      response.body.data.forEach(student => {
        expect(student.branchId).toBe('dps-main');
      });
    });

    it('should handle pagination with page=1&pageSize=1', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/students?page=1&pageSize=1')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(1);

      if (response.body.total > 0) {
        expect(response.body.data.length).toBe(1);
      }
    });

    it('should handle sorting with sort=-id (descending by id)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/students?sort=-id&page=1&pageSize=5')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);

      if (response.body.data.length > 1) {
        const ids = response.body.data.map(student => student.id);
        const sortedIds = [...ids].sort().reverse(); // Descending order
        expect(ids).toEqual(sortedIds);
      }
    });

    it('should handle complex query combination from frontend', async () => {
      // This reproduces the exact query from the frontend issue
      const response = await request(app.getHttpServer())
        .get('/api/v1/students?status=active&q=a&page=1&pageSize=1&sort=-id')
        .set('X-Branch-Id', 'dps-main')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(1);

      // If data exists, verify all filters are applied
      response.body.data.forEach(student => {
        // Should have status=active
        expect(student.status).toBe('active');
        // Should match search term 'a'
        const matchesSearch = 
          student.firstName.toLowerCase().includes('a') ||
          student.lastName.toLowerCase().includes('a') ||
          student.admissionNo.toLowerCase().includes('a');
        expect(matchesSearch).toBe(true);
        // Should belong to correct branch
        expect(student.branchId).toBe('dps-main');
      });
    });

    it('should handle empty search results gracefully', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/students?q=zzz_nonexistent_search_term')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
      expect(response.body.total).toBe(0);
    });
  });
=======
>>>>>>> origin/main
});