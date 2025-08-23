import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

describe('Marks API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.PORT = '0';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    
    // Add the branch context middleware
    app.use((req: any, _res: any, next: any) => {
      (req as any).requestId = req.headers['x-request-id'] || uuidv4();
      const tenantId = (req.headers['x-tenant-id'] as string | undefined) || undefined;
      const branchId = (req.headers['x-branch-id'] as string | undefined) || undefined;
      PrismaService.runWithScope({ tenantId, branchId }, () => next());
    });
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        validationError: { target: false },
      }),
    );
    await app.init();
    
    // IMPORTANT: Tests rely on seed data from apps/api/prisma/seed.ts
    // The seed script creates data for 'test-branch' tenant
    // Run: cd apps/api && npx prisma db seed
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/marks', () => {
    it('should return paginated list with correct format', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/marks?page=1&pageSize=5')
        .set('X-Branch-Id', 'test-branch')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(typeof response.body.total).toBe('number');
    });

    it('should include exam, subject, and student details', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/marks?page=1&pageSize=1')
        .set('X-Branch-Id', 'test-branch')
        .expect(200);

      if (response.body.data.length > 0) {
        const mark = response.body.data[0];
        
        expect(mark).toHaveProperty('id');
        expect(mark).toHaveProperty('branchId', 'branch1');
        expect(mark).toHaveProperty('examId');
        expect(mark).toHaveProperty('subjectId');
        expect(mark).toHaveProperty('studentId');
        expect(mark).toHaveProperty('totalMarks');
        expect(mark).toHaveProperty('isAbsent');
        
        // Check included relations
        expect(mark).toHaveProperty('exam');
        expect(mark.exam).toHaveProperty('name');
        expect(mark).toHaveProperty('subject');
        expect(mark.subject).toHaveProperty('name');
        expect(mark).toHaveProperty('student');
        expect(mark.student).toHaveProperty('firstName');
      }
    });

    it('should isolate data between tenants', async () => {
      const [branch1Response, branch2Response] = await Promise.all([
        request(app.getHttpServer())
          .get('/api/v1/marks')
          .set('X-Branch-Id', 'test-branch'),
        request(app.getHttpServer())
          .get('/api/v1/marks')
          .set('X-Branch-Id', 'test-branch2')
      ]);

      // Verify isolation
      const branch1Ids = branch1Response.body.data.map(item => item.id);
      const branch2Ids = branch2Response.body.data.map(item => item.id);
      const intersection = branch1Ids.filter(id => branch2Ids.includes(id));
      
      expect(intersection.length).toBe(0);
      
      // Verify branchId
      branch1Response.body.data.forEach(item => {
        expect(item.branchId).toBe('test-branch');
      });
      
      branch2Response.body.data.forEach(item => {
        expect(item.branchId).toBe('test-branch2');
      });
    });

    it('should support ascending sorting by student name', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/marks?sort=student')
        .set('X-Branch-Id', 'test-branch')
        .expect(200);

      if (response.body.data.length > 1) {
        const studentNames = response.body.data.map(mark => 
          `${mark.student.firstName} ${mark.student.lastName}`
        );
        const sortedNames = [...studentNames].sort();
        expect(studentNames).toEqual(sortedNames);
      }
    });

    it('should support descending sorting by created date', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/marks?sort=-createdAt')
        .set('X-Branch-Id', 'test-branch')
        .expect(200);

      if (response.body.data.length > 1) {
        const dates = response.body.data.map(mark => new Date(mark.createdAt));
        for (let i = 1; i < dates.length; i++) {
          expect(dates[i - 1].getTime()).toBeGreaterThanOrEqual(dates[i].getTime());
        }
      }
    });

    it('should support filtering by examId', async () => {
      // First get an examId from the data
      const allMarks = await request(app.getHttpServer())
        .get('/api/v1/marks?page=1&pageSize=10')
        .set('X-Branch-Id', 'test-branch');
      
      if (allMarks.body.data.length > 0) {
        const examId = allMarks.body.data[0].examId;
        
        const response = await request(app.getHttpServer())
          .get(`/api/v1/marks?examId=${examId}`)
          .set('X-Branch-Id', 'test-branch')
          .expect(200);

        response.body.data.forEach(mark => {
          expect(mark.examId).toBe(examId);
        });
      }
    });

    it('should support filtering by subjectId', async () => {
      // First get a subjectId from the data
      const allMarks = await request(app.getHttpServer())
        .get('/api/v1/marks?page=1&pageSize=10')
        .set('X-Branch-Id', 'test-branch');
      
      if (allMarks.body.data.length > 0) {
        const subjectId = allMarks.body.data[0].subjectId;
        
        const response = await request(app.getHttpServer())
          .get(`/api/v1/marks?subjectId=${subjectId}`)
          .set('X-Branch-Id', 'test-branch')
          .expect(200);

        response.body.data.forEach(mark => {
          expect(mark.subjectId).toBe(subjectId);
        });
      }
    });

    it('should support filtering by studentId', async () => {
      // First get a studentId from the data
      const allMarks = await request(app.getHttpServer())
        .get('/api/v1/marks?page=1&pageSize=10')
        .set('X-Branch-Id', 'test-branch');
      
      if (allMarks.body.data.length > 0) {
        const studentId = allMarks.body.data[0].studentId;
        
        const response = await request(app.getHttpServer())
          .get(`/api/v1/marks?studentId=${studentId}`)
          .set('X-Branch-Id', 'test-branch')
          .expect(200);

        response.body.data.forEach(mark => {
          expect(mark.studentId).toBe(studentId);
        });
      }
    });

    it('should support filtering by isAbsent status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/marks?isAbsent=false')
        .set('X-Branch-Id', 'test-branch')
        .expect(200);

      response.body.data.forEach(mark => {
        expect(mark.isAbsent).toBe(false);
      });
    });

    it('should support text search by student name', async () => {
      // Get a student name from existing data
      const allMarks = await request(app.getHttpServer())
        .get('/api/v1/marks?page=1&pageSize=1')
        .set('X-Branch-Id', 'test-branch');
      
      if (allMarks.body.data.length > 0) {
        const firstName = allMarks.body.data[0].student.firstName;
        
        const response = await request(app.getHttpServer())
          .get(`/api/v1/marks?q=${firstName}`)
          .set('X-Branch-Id', 'test-branch')
          .expect(200);

        response.body.data.forEach(mark => {
          const fullName = `${mark.student.firstName} ${mark.student.lastName}`.toLowerCase();
          expect(fullName).toContain(firstName.toLowerCase());
        });
      }
    });

    it('should support text search by subject name', async () => {
      // Get a subject name from existing data
      const allMarks = await request(app.getHttpServer())
        .get('/api/v1/marks?page=1&pageSize=1')
        .set('X-Branch-Id', 'test-branch');
      
      if (allMarks.body.data.length > 0) {
        const subjectName = allMarks.body.data[0].subject.name;
        
        const response = await request(app.getHttpServer())
          .get(`/api/v1/marks?q=${subjectName}`)
          .set('X-Branch-Id', 'test-branch')
          .expect(200);

        response.body.data.forEach(mark => {
          expect(mark.subject.name.toLowerCase()).toContain(subjectName.toLowerCase());
        });
      }
    });

    it('should handle pagination correctly', async () => {
      const page1 = await request(app.getHttpServer())
        .get('/api/v1/marks?page=1&pageSize=2')
        .set('X-Branch-Id', 'test-branch')
        .expect(200);

      const page2 = await request(app.getHttpServer())
        .get('/api/v1/marks?page=2&pageSize=2')
        .set('X-Branch-Id', 'test-branch')
        .expect(200);

      // Verify no overlap
      const page1Ids = page1.body.data.map(item => item.id);
      const page2Ids = page2.body.data.map(item => item.id);
      const overlap = page1Ids.filter(id => page2Ids.includes(id));
      
      expect(overlap.length).toBe(0);
    });
  });

  describe('GET /api/v1/marks/:id', () => {
    it('should return single mark with correct format', async () => {
      // First get list to find an ID
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/marks')
        .set('X-Branch-Id', 'test-branch');
      
      const testId = listResponse.body.data[0]?.id;
      if (!testId) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/marks/${testId}`)
        .set('X-Branch-Id', 'test-branch')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', testId);
      expect(response.body.data).toHaveProperty('branchId', 'branch1');
      
      // Check included relations
      expect(response.body.data).toHaveProperty('exam');
      expect(response.body.data).toHaveProperty('subject');
      expect(response.body.data).toHaveProperty('student');
    });

    it('should return 404 for non-existent mark', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/marks/non-existent-id')
        .set('X-Branch-Id', 'test-branch')
        .expect(404);
    });

    it('should not return mark from different tenant', async () => {
      // Get mark from branch1
      const branch1List = await request(app.getHttpServer())
        .get('/api/v1/marks')
        .set('X-Branch-Id', 'test-branch');
      
      const branch1Id = branch1List.body.data[0]?.id;
      if (!branch1Id) return;

      // Try to access from branch2
      await request(app.getHttpServer())
        .get(`/api/v1/marks/${branch1Id}`)
        .set('X-Branch-Id', 'test-branch2')
        .expect(404);
    });
  });

  describe('POST /api/v1/marks', () => {
    let testExamId: string;
    let testSubjectId: string;
    let testStudentId: string;

    beforeAll(async () => {
      // Get test data from existing marks or create test dependencies
      const marksResponse = await request(app.getHttpServer())
        .get('/api/v1/marks?page=1&pageSize=1')
        .set('X-Branch-Id', 'test-branch');
        
      if (marksResponse.body.data.length > 0) {
        testExamId = marksResponse.body.data[0].examId;
        testSubjectId = marksResponse.body.data[0].subjectId;
        testStudentId = marksResponse.body.data[0].studentId;
      }
    });

    it('should create new mark with correct format', async () => {
      if (!testExamId || !testSubjectId || !testStudentId) return;

      // Use different student to avoid unique constraint
      const studentsResponse = await request(app.getHttpServer())
        .get('/api/v1/students?page=1&pageSize=10')
        .set('X-Branch-Id', 'test-branch');

      const differentStudent = studentsResponse.body.data.find(s => s.id !== testStudentId);
      if (!differentStudent) return;

      const newMark = {
        examId: testExamId,
        subjectId: testSubjectId,
        studentId: differentStudent.id,
        theoryMarks: 85,
        practicalMarks: 90,
        totalMarks: 175,
        grade: 'A',
        remarks: 'Excellent performance',
        isAbsent: false
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/marks')
        .set('X-Branch-Id', 'test-branch')
        .send(newMark)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.branchId).toBe('test-branch');
      expect(response.body.data.examId).toBe(newMark.examId);
      expect(response.body.data.subjectId).toBe(newMark.subjectId);
      expect(response.body.data.studentId).toBe(newMark.studentId);
      expect(response.body.data.theoryMarks).toBe(newMark.theoryMarks);
      expect(response.body.data.practicalMarks).toBe(newMark.practicalMarks);
      expect(response.body.data.totalMarks).toBe(newMark.totalMarks);
      expect(response.body.data.grade).toBe(newMark.grade);
      expect(response.body.data.remarks).toBe(newMark.remarks);
      expect(response.body.data.isAbsent).toBe(newMark.isAbsent);
    });

    it('should auto-calculate totalMarks if not provided', async () => {
      if (!testExamId || !testSubjectId || !testStudentId) return;

      // Use different student to avoid unique constraint
      const studentsResponse = await request(app.getHttpServer())
        .get('/api/v1/students?page=2&pageSize=10')
        .set('X-Branch-Id', 'test-branch');

      const differentStudent = studentsResponse.body.data.find(s => s.id !== testStudentId);
      if (!differentStudent) return;

      const newMark = {
        examId: testExamId,
        subjectId: testSubjectId,
        studentId: differentStudent.id,
        theoryMarks: 70,
        practicalMarks: 80,
        projectMarks: 90,
        internalMarks: 85,
        // totalMarks not provided - should be auto-calculated
        grade: 'B+',
        isAbsent: false
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/marks')
        .set('X-Branch-Id', 'test-branch')
        .send(newMark)
        .expect(201);

      expect(response.body.data.totalMarks).toBe(325); // 70 + 80 + 90 + 85
    });

    it('should handle absent student correctly', async () => {
      if (!testExamId || !testSubjectId || !testStudentId) return;

      // Use different student to avoid unique constraint
      const studentsResponse = await request(app.getHttpServer())
        .get('/api/v1/students?page=3&pageSize=10')
        .set('X-Branch-Id', 'test-branch');

      const differentStudent = studentsResponse.body.data.find(s => s.id !== testStudentId);
      if (!differentStudent) return;

      const newMark = {
        examId: testExamId,
        subjectId: testSubjectId,
        studentId: differentStudent.id,
        isAbsent: true,
        remarks: 'Student was absent'
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/marks')
        .set('X-Branch-Id', 'test-branch')
        .send(newMark)
        .expect(201);

      expect(response.body.data.isAbsent).toBe(true);
      expect(response.body.data.totalMarks).toBeNull();
      expect(response.body.data.remarks).toBe('Student was absent');
    });

    it('should validate required fields', async () => {
      const invalidMark = {
        // Missing required examId, subjectId, studentId
        theoryMarks: 85
      };

      await request(app.getHttpServer())
        .post('/api/v1/marks')
        .set('X-Branch-Id', 'test-branch')
        .send(invalidMark)
        .expect(400);
    });

    it('should prevent duplicate mark entries', async () => {
      if (!testExamId || !testSubjectId || !testStudentId) return;

      const duplicateMark = {
        examId: testExamId,
        subjectId: testSubjectId,
        studentId: testStudentId, // Same combination as existing
        theoryMarks: 85,
        isAbsent: false
      };

      await request(app.getHttpServer())
        .post('/api/v1/marks')
        .set('X-Branch-Id', 'test-branch')
        .send(duplicateMark)
        .expect(400);
    });
  });

  describe('PATCH /api/v1/marks/:id', () => {
    it('should update mark with correct format', async () => {
      // First create a mark to update
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/marks?page=1&pageSize=1')
        .set('X-Branch-Id', 'test-branch');

      if (listResponse.body.data.length === 0) return;

      const existingMark = listResponse.body.data[0];
      const markId = existingMark.id;

      const updateData = {
        theoryMarks: 95,
        practicalMarks: 88,
        grade: 'A+',
        remarks: 'Updated - Excellent work'
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/marks/${markId}`)
        .set('X-Branch-Id', 'test-branch')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(markId);
      expect(response.body.data.theoryMarks).toBe(updateData.theoryMarks);
      expect(response.body.data.practicalMarks).toBe(updateData.practicalMarks);
      expect(response.body.data.grade).toBe(updateData.grade);
      expect(response.body.data.remarks).toBe(updateData.remarks);
    });

    it('should auto-recalculate totalMarks when component marks are updated', async () => {
      // First get a mark to update
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/marks?page=1&pageSize=1')
        .set('X-Branch-Id', 'test-branch');

      if (listResponse.body.data.length === 0) return;

      const markId = listResponse.body.data[0].id;

      const updateData = {
        theoryMarks: 80,
        practicalMarks: 75,
        projectMarks: 85,
        internalMarks: 90
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/marks/${markId}`)
        .set('X-Branch-Id', 'test-branch')
        .send(updateData)
        .expect(200);

      expect(response.body.data.totalMarks).toBe(330); // 80 + 75 + 85 + 90
    });

    it('should return 404 for non-existent mark', async () => {
      const updateData = { theoryMarks: 90 };

      await request(app.getHttpServer())
        .patch('/api/v1/marks/non-existent-id')
        .set('X-Branch-Id', 'test-branch')
        .send(updateData)
        .expect(404);
    });

    it('should not update mark from different tenant', async () => {
      // Get mark from branch1
      const branch1List = await request(app.getHttpServer())
        .get('/api/v1/marks')
        .set('X-Branch-Id', 'test-branch');
      
      const branch1Id = branch1List.body.data[0]?.id;
      if (!branch1Id) return;

      // Try to update from branch2
      await request(app.getHttpServer())
        .patch(`/api/v1/marks/${branch1Id}`)
        .set('X-Branch-Id', 'test-branch2')
        .send({ theoryMarks: 100 })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/marks/:id', () => {
    it('should delete mark successfully', async () => {
      // First create a mark to delete
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/marks?page=1&pageSize=10')
        .set('X-Branch-Id', 'test-branch');

      if (listResponse.body.data.length === 0) return;

      const markToDelete = listResponse.body.data[listResponse.body.data.length - 1]; // Get last one
      const markId = markToDelete.id;

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/marks/${markId}`)
        .set('X-Branch-Id', 'test-branch')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', markId);

      // Verify it's deleted
      await request(app.getHttpServer())
        .get(`/api/v1/marks/${markId}`)
        .set('X-Branch-Id', 'test-branch')
        .expect(404);
    });

    it('should return 404 for non-existent mark', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/marks/non-existent-id')
        .set('X-Branch-Id', 'test-branch')
        .expect(404);
    });

    it('should not delete mark from different tenant', async () => {
      // Get mark from branch1
      const branch1List = await request(app.getHttpServer())
        .get('/api/v1/marks')
        .set('X-Branch-Id', 'test-branch');
      
      const branch1Id = branch1List.body.data[0]?.id;
      if (!branch1Id) return;

      // Try to delete from branch2
      await request(app.getHttpServer())
        .delete(`/api/v1/marks/${branch1Id}`)
        .set('X-Branch-Id', 'test-branch2')
        .expect(404);
    });
  });

  describe('GET /api/v1/marks/exam/:examId', () => {
    it('should return marks for specific exam', async () => {
      // First get an examId from existing data
      const marksResponse = await request(app.getHttpServer())
        .get('/api/v1/marks?page=1&pageSize=1')
        .set('X-Branch-Id', 'test-branch');

      if (marksResponse.body.data.length === 0) return;

      const examId = marksResponse.body.data[0].examId;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/marks/exam/${examId}`)
        .set('X-Branch-Id', 'test-branch')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);

      response.body.data.forEach(mark => {
        expect(mark.examId).toBe(examId);
        expect(mark.branchId).toBe('branch1');
        expect(mark).toHaveProperty('subject');
        expect(mark).toHaveProperty('student');
        expect(mark.student).toHaveProperty('firstName');
        expect(mark.student).toHaveProperty('admissionNo');
      });
    });
  });

  describe('GET /api/v1/marks/student/:studentId', () => {
    it('should return marks for specific student', async () => {
      // First get a studentId from existing data
      const marksResponse = await request(app.getHttpServer())
        .get('/api/v1/marks?page=1&pageSize=1')
        .set('X-Branch-Id', 'test-branch');

      if (marksResponse.body.data.length === 0) return;

      const studentId = marksResponse.body.data[0].studentId;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/marks/student/${studentId}`)
        .set('X-Branch-Id', 'test-branch')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);

      response.body.data.forEach(mark => {
        expect(mark.studentId).toBe(studentId);
        expect(mark.branchId).toBe('branch1');
        expect(mark).toHaveProperty('exam');
        expect(mark).toHaveProperty('subject');
        expect(mark.exam).toHaveProperty('name');
        expect(mark.subject).toHaveProperty('name');
      });
    });
  });

  describe('POST /api/v1/marks/bulk/:examId/:subjectId', () => {
    it('should bulk create/update marks for exam-subject combination', async () => {
      // Get test data
      const marksResponse = await request(app.getHttpServer())
        .get('/api/v1/marks?page=1&pageSize=1')
        .set('X-Branch-Id', 'test-branch');

      if (marksResponse.body.data.length === 0) return;

      const { examId, subjectId } = marksResponse.body.data[0];

      // Get some students
      const studentsResponse = await request(app.getHttpServer())
        .get('/api/v1/students?page=1&pageSize=3')
        .set('X-Branch-Id', 'test-branch');

      if (studentsResponse.body.data.length < 2) return;

      const bulkMarks = studentsResponse.body.data.slice(0, 2).map((student, index) => ({
        studentId: student.id,
        theoryMarks: 80 + (index * 5),
        practicalMarks: 75 + (index * 5),
        grade: index === 0 ? 'B+' : 'A-',
        isAbsent: false
      }));

      const response = await request(app.getHttpServer())
        .post(`/api/v1/marks/bulk/${examId}/${subjectId}`)
        .set('X-Branch-Id', 'test-branch')
        .send(bulkMarks)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(bulkMarks.length);
      expect(response.body.count).toBe(bulkMarks.length);
    });
  });

  describe('Branch context validation', () => {
    it('should require X-Branch-Id header', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/marks')
        // No X-Branch-Id header
        .expect(400);
    });

    it('should reject empty X-Branch-Id', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/marks')
        .set('X-Branch-Id', '')
        .expect(400);
    });
  });
});