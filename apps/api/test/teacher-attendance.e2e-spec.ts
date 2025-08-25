import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('TeacherAttendance (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let teacherAttendanceId: string;
  let teacherId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();

    // Get a teacher from seed data for testing
    const teacher = await prisma.teacher.findFirst({
      where: { branchId: 'branch1' }
    });
    expect(teacher).toBeDefined();
    teacherId = teacher.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (teacherAttendanceId) {
      await prisma.teacherAttendance.deleteMany({
        where: { branchId: 'branch1' }
      });
    }
    await app.close();
  });

  describe('GET /api/v1/teacher-attendance', () => {
    it('should return paginated teacher attendance records for branch1', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/teacher-attendance')
        .query({ page: 1, pageSize: 10 })
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(typeof response.body.total).toBe('number');
    });

    it('should return filtered teacher attendance records by teacherId', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/teacher-attendance')
        .query({ 
          page: 1, 
          pageSize: 10,
          filter: JSON.stringify({ teacherId })
        })
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return sorted teacher attendance records', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/teacher-attendance')
        .query({ 
          page: 1, 
          pageSize: 10,
          sort: JSON.stringify({ field: 'date', order: 'DESC' })
        })
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
    });

    it('should isolate data by branch', async () => {
      const branch1Response = await request(app.getHttpServer())
        .get('/api/v1/teacher-attendance')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const branch2Response = await request(app.getHttpServer())
        .get('/api/v1/teacher-attendance')
        .set('X-Branch-Id', 'branch2')
        .expect(200);

      // Data should be isolated by branch
      expect(branch1Response.body.data).not.toEqual(branch2Response.body.data);
    });
  });

  describe('POST /api/v1/teacher-attendance', () => {
    it('should create a new teacher attendance record', async () => {
      const newTeacherAttendance = {
        teacherId,
        date: '2024-01-15',
        checkIn: '08:00',
        checkOut: '16:00',
        status: 'PRESENT',
        remarks: 'On time'
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/teacher-attendance')
        .set('X-Branch-Id', 'branch1')
        .send(newTeacherAttendance)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toMatchObject({
        teacherId,
        date: '2024-01-15',
        checkIn: '08:00',
        checkOut: '16:00',
        status: 'PRESENT',
        remarks: 'On time',
        branchId: 'branch1'
      });

      teacherAttendanceId = response.body.data.id;
    });

    it('should create teacher attendance record with leave type', async () => {
      const leaveRecord = {
        teacherId,
        date: '2024-01-16',
        status: 'ON_LEAVE',
        leaveType: 'SICK',
        remarks: 'Medical leave'
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/teacher-attendance')
        .set('X-Branch-Id', 'branch1')
        .send(leaveRecord)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toMatchObject({
        teacherId,
        date: '2024-01-16',
        status: 'ON_LEAVE',
        leaveType: 'SICK',
        remarks: 'Medical leave',
        branchId: 'branch1'
      });
    });

    it('should enforce branch isolation on create', async () => {
      const uniqueDate = new Date().toISOString().split('T')[0]; // Use today's date to avoid conflicts
      const newRecord = {
        teacherId,
        date: uniqueDate,
        status: 'PRESENT'
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/teacher-attendance')
        .set('X-Branch-Id', 'branch2')
        .send(newRecord)
        .expect(201);

      expect(response.body.data.branchId).toBe('branch2');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        // Missing teacherId, date, and status (required fields)
        checkIn: '08:00',
        remarks: 'Test'
      };
      
      await request(app.getHttpServer())
        .post('/api/v1/teacher-attendance')
        .set('X-Branch-Id', 'branch1')
        .send(invalidData)
        .expect(422);
    });
  });

  describe('GET /api/v1/teacher-attendance/:id', () => {
    it('should return a single teacher attendance record', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/teacher-attendance/${teacherAttendanceId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toMatchObject({
        id: teacherAttendanceId,
        teacherId,
        date: '2024-01-15',
        status: 'PRESENT',
        branchId: 'branch1'
      });
    });

    it('should enforce branch isolation', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/teacher-attendance/${teacherAttendanceId}`)
        .set('X-Branch-Id', 'branch2')
        .expect(404);
    });

    it('should return 404 for non-existent id', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/teacher-attendance/non-existent-id')
        .set('X-Branch-Id', 'branch1')
        .expect(404);
    });
  });

  describe('PUT /api/v1/teacher-attendance/:id', () => {
    it('should update a teacher attendance record', async () => {
      const updateData = {
        checkOut: '17:00',
        status: 'LATE',
        remarks: 'Left early due to emergency'
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/teacher-attendance/${teacherAttendanceId}`)
        .set('X-Branch-Id', 'branch1')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toMatchObject({
        id: teacherAttendanceId,
        checkOut: '17:00',
        status: 'LATE',
        remarks: 'Left early due to emergency'
      });
    });

    it('should enforce branch isolation on update', async () => {
      await request(app.getHttpServer())
        .put(`/api/v1/teacher-attendance/${teacherAttendanceId}`)
        .set('X-Branch-Id', 'branch2')
        .send({ status: 'ABSENT' })
        .expect(404);
    });

    it('should return 404 for non-existent id', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/teacher-attendance/non-existent-id')
        .set('X-Branch-Id', 'branch1')
        .send({ status: 'PRESENT' })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/teacher-attendance/:id', () => {
    it('should delete a teacher attendance record', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/teacher-attendance/${teacherAttendanceId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(teacherAttendanceId);

      // Verify record is deleted
      await request(app.getHttpServer())
        .get(`/api/v1/teacher-attendance/${teacherAttendanceId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(404);
    });

    it('should enforce branch isolation on delete', async () => {
      // Create a new record to test deletion with wrong branch
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/teacher-attendance')
        .set('X-Branch-Id', 'branch1')
        .send({
          teacherId,
          date: '2024-01-20',
          status: 'PRESENT'
        })
        .expect(201);

      const newId = createResponse.body.data.id;

      // Try to delete with wrong branch
      await request(app.getHttpServer())
        .delete(`/api/v1/teacher-attendance/${newId}`)
        .set('X-Branch-Id', 'branch2')
        .expect(404);

      // Verify record still exists in correct branch
      await request(app.getHttpServer())
        .get(`/api/v1/teacher-attendance/${newId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      // Clean up
      await request(app.getHttpServer())
        .delete(`/api/v1/teacher-attendance/${newId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);
    });

    it('should return 404 for non-existent id', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/teacher-attendance/non-existent-id')
        .set('X-Branch-Id', 'branch1')
        .expect(404);
    });
  });

  describe('GET /api/v1/teacher-attendance (GetMany)', () => {
    let recordIds: string[] = [];

    beforeAll(async () => {
      // Create multiple records for getMany testing
      const records = [
        { teacherId, date: '2024-01-21', status: 'PRESENT' },
        { teacherId, date: '2024-01-22', status: 'LATE' },
        { teacherId, date: '2024-01-23', status: 'ABSENT' }
      ];

      for (const record of records) {
        const response = await request(app.getHttpServer())
          .post('/api/v1/teacher-attendance')
          .set('X-Branch-Id', 'branch1')
          .send(record)
          .expect(201);
        recordIds.push(response.body.data.id);
      }
    });

    afterAll(async () => {
      // Clean up
      for (const id of recordIds) {
        await request(app.getHttpServer())
          .delete(`/api/v1/teacher-attendance/${id}`)
          .set('X-Branch-Id', 'branch1');
      }
    });

    it('should return multiple specific records when ids are provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/teacher-attendance')
        .query({ id: recordIds })
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(recordIds.length);
      
      const returnedIds = response.body.data.map((record: any) => record.id);
      recordIds.forEach(id => {
        expect(returnedIds).toContain(id);
      });
    });

    it('should enforce branch isolation for getMany', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/teacher-attendance')
        .query({ id: recordIds })
        .set('X-Branch-Id', 'branch2')
        .expect(200);

      expect(response.body.data).toEqual([]);
    });
  });
});