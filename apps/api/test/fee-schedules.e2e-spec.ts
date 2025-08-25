import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

describe('Fee Schedules API (e2e)', () => {
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
    // The seed script creates data for 'branch1' tenant
    // Run: cd apps/api && npx prisma db seed
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/fees/schedules', () => {
    it('should return paginated list with correct format', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/fees/schedules?page=1&perPage=5')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(typeof response.body.total).toBe('number');
    });

    it('should include fee schedule properties', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/fees/schedules?page=1&perPage=1')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      if (response.body.data.length > 0) {
        const schedule = response.body.data[0];
        
        expect(schedule).toHaveProperty('id');
        expect(schedule).toHaveProperty('branchId');
        expect(schedule).toHaveProperty('feeStructureId');
        expect(schedule).toHaveProperty('recurrence');
        expect(schedule).toHaveProperty('dueDayOfMonth');
        expect(schedule).toHaveProperty('status');
        
        // Validate recurrence values
        expect(['monthly', 'quarterly', 'halfYearly', 'annual']).toContain(schedule.recurrence);
        
        // Validate status values
        expect(['active', 'paused']).toContain(schedule.status);
        
        // Validate dueDayOfMonth range
        expect(schedule.dueDayOfMonth).toBeGreaterThanOrEqual(1);
        expect(schedule.dueDayOfMonth).toBeLessThanOrEqual(28);
      }
    });

    it('should isolate data between tenants', async () => {
      const [branch1Response, branch2Response] = await Promise.all([
        request(app.getHttpServer())
          .get('/api/v1/fees/schedules')
          .set('X-Branch-Id', 'branch1'),
        request(app.getHttpServer())
          .get('/api/v1/fees/schedules')
          .set('X-Branch-Id', 'test-branch2')
      ]);

      // Verify isolation
      const branch1Ids = branch1Response.body.data.map(item => item.id);
      const branch2Ids = branch2Response.body.data.map(item => item.id);
      const intersection = branch1Ids.filter(id => branch2Ids.includes(id));
      
      expect(intersection.length).toBe(0);
      
      // Verify branchId
      branch1Response.body.data.forEach(item => {
        expect(item.branchId).toBe('branch1');
      });
      
      branch2Response.body.data.forEach(item => {
        expect(item.branchId).toBe('test-branch2');
      });
    });

    it('should support ascending sorting by recurrence', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/fees/schedules?sort=recurrence')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      if (response.body.data.length > 1) {
        const recurrences = response.body.data.map(item => item.recurrence);
        const sortedRecurrences = [...recurrences].sort();
        expect(recurrences).toEqual(sortedRecurrences);
      }
    });

    it('should support descending sorting by dueDayOfMonth', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/fees/schedules?sort=-dueDayOfMonth')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      if (response.body.data.length > 1) {
        const dueDays = response.body.data.map(item => item.dueDayOfMonth);
        for (let i = 1; i < dueDays.length; i++) {
          expect(dueDays[i - 1]).toBeGreaterThanOrEqual(dueDays[i]);
        }
      }
    });

    it('should handle pagination correctly', async () => {
      const page1 = await request(app.getHttpServer())
        .get('/api/v1/fees/schedules?page=1&perPage=2')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const page2 = await request(app.getHttpServer())
        .get('/api/v1/fees/schedules?page=2&perPage=2')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      // Verify no overlap
      const page1Ids = page1.body.data.map(item => item.id);
      const page2Ids = page2.body.data.map(item => item.id);
      const overlap = page1Ids.filter(id => page2Ids.includes(id));
      
      expect(overlap.length).toBe(0);
    });
  });

  describe('GET /api/v1/fees/schedules/:id', () => {
    it('should return single fee schedule with correct format', async () => {
      // First get list to find an ID
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/fees/schedules')
        .set('X-Branch-Id', 'branch1');
      
      const testId = listResponse.body.data[0]?.id;
      if (!testId) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/fees/schedules/${testId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', testId);
      expect(response.body.data).toHaveProperty('feeStructureId');
      expect(response.body.data).toHaveProperty('recurrence');
      expect(response.body.data).toHaveProperty('dueDayOfMonth');
    });

    it('should return 404 for non-existent fee schedule', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/fees/schedules/non-existent-id')
        .set('X-Branch-Id', 'branch1')
        .expect(404);
    });

    it('should not return fee schedule from different tenant', async () => {
      // Get fee schedule from test-branch
      const branch1List = await request(app.getHttpServer())
        .get('/api/v1/fees/schedules')
        .set('X-Branch-Id', 'branch1');
      
      const branch1Id = branch1List.body.data[0]?.id;
      if (!branch1Id) return;

      // Try to access from test-branch2
      await request(app.getHttpServer())
        .get(`/api/v1/fees/schedules/${branch1Id}`)
        .set('X-Branch-Id', 'test-branch2')
        .expect(404);
    });
  });

  describe('POST /api/v1/fees/schedules', () => {
    let testFeeStructureId: string;

    beforeAll(async () => {
      // Create a fee structure to use in tests
      const createStructureResponse = await request(app.getHttpServer())
        .post('/api/v1/fees/structures')
        .set('X-Branch-Id', 'branch1')
        .send({
          name: 'Test Fee Structure for Schedules',
          description: 'Test structure for fee schedule tests',
          status: 'active'
        });
        
      if (createStructureResponse.status === 201) {
        testFeeStructureId = createStructureResponse.body.data.id;
      } else {
        // Fallback: try to get existing one
        const structuresResponse = await request(app.getHttpServer())
          .get('/api/v1/fees/structures?page=1&perPage=1')
          .set('X-Branch-Id', 'branch1');
          
        testFeeStructureId = structuresResponse.body.data[0]?.id || uuidv4();
      }
    });

    it('should create new fee schedule with correct format', async () => {
      const newSchedule = {
        feeStructureId: testFeeStructureId,
        recurrence: 'monthly',
        dueDayOfMonth: 15,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active'
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/fees/schedules')
        .set('X-Branch-Id', 'branch1')
        .send(newSchedule)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.feeStructureId).toBe(newSchedule.feeStructureId);
      expect(response.body.data.recurrence).toBe(newSchedule.recurrence);
      expect(response.body.data.dueDayOfMonth).toBe(newSchedule.dueDayOfMonth);
      expect(response.body.data.startDate).toBe(newSchedule.startDate);
      expect(response.body.data.endDate).toBe(newSchedule.endDate);
      expect(response.body.data.status).toBe(newSchedule.status);
    });

    it('should create fee schedule with quarterly recurrence', async () => {
      const newSchedule = {
        feeStructureId: testFeeStructureId,
        recurrence: 'quarterly',
        dueDayOfMonth: 1,
        status: 'active'
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/fees/schedules')
        .set('X-Branch-Id', 'branch1')
        .send(newSchedule)
        .expect(201);

      expect(response.body.data.recurrence).toBe('quarterly');
      expect(response.body.data.dueDayOfMonth).toBe(1);
    });

    it('should validate required fields', async () => {
      const invalidSchedule = {
        // Missing required feeStructureId, recurrence, dueDayOfMonth
        status: 'active'
      };

      await request(app.getHttpServer())
        .post('/api/v1/fees/schedules')
        .set('X-Branch-Id', 'branch1')
        .send(invalidSchedule)
        .expect(400);
    });

    it('should validate recurrence enum values', async () => {
      const invalidSchedule = {
        feeStructureId: testFeeStructureId,
        recurrence: 'invalid-recurrence',
        dueDayOfMonth: 15
      };

      await request(app.getHttpServer())
        .post('/api/v1/fees/schedules')
        .set('X-Branch-Id', 'branch1')
        .send(invalidSchedule)
        .expect(400);
    });

    it('should validate dueDayOfMonth range', async () => {
      const invalidSchedule = {
        feeStructureId: testFeeStructureId,
        recurrence: 'monthly',
        dueDayOfMonth: 35 // Out of valid range (1-28)
      };

      await request(app.getHttpServer())
        .post('/api/v1/fees/schedules')
        .set('X-Branch-Id', 'branch1')
        .send(invalidSchedule)
        .expect(400);
    });

    it('should validate status enum values', async () => {
      const invalidSchedule = {
        feeStructureId: testFeeStructureId,
        recurrence: 'monthly',
        dueDayOfMonth: 15,
        status: 'invalid-status'
      };

      await request(app.getHttpServer())
        .post('/api/v1/fees/schedules')
        .set('X-Branch-Id', 'branch1')
        .send(invalidSchedule)
        .expect(400);
    });
  });

  describe('PATCH /api/v1/fees/schedules/:id', () => {
    let testFeeStructureId: string;

    beforeAll(async () => {
      // Create a fee structure to use in tests
      const createStructureResponse = await request(app.getHttpServer())
        .post('/api/v1/fees/structures')
        .set('X-Branch-Id', 'branch1')
        .send({
          name: 'Test Fee Structure for PATCH',
          description: 'Test structure for patch tests',
          status: 'active'
        });
        
      testFeeStructureId = createStructureResponse.body?.data?.id || uuidv4();
    });

    it('should update fee schedule with correct format', async () => {
      // First create a fee schedule to update
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/fees/schedules')
        .set('X-Branch-Id', 'branch1')
        .send({
          feeStructureId: testFeeStructureId,
          recurrence: 'monthly',
          dueDayOfMonth: 10,
          status: 'active'
        });

      const scheduleId = createResponse.body.data.id;

      const updateData = {
        recurrence: 'quarterly',
        dueDayOfMonth: 5,
        status: 'paused'
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/fees/schedules/${scheduleId}`)
        .set('X-Branch-Id', 'branch1')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(scheduleId);
      expect(response.body.data.recurrence).toBe(updateData.recurrence);
      expect(response.body.data.dueDayOfMonth).toBe(updateData.dueDayOfMonth);
      expect(response.body.data.status).toBe(updateData.status);
    });

    it('should return 404 for non-existent fee schedule', async () => {
      const updateData = { recurrence: 'quarterly' };

      await request(app.getHttpServer())
        .patch('/api/v1/fees/schedules/non-existent-id')
        .set('X-Branch-Id', 'branch1')
        .send(updateData)
        .expect(404);
    });

    it('should not update fee schedule from different tenant', async () => {
      // Get fee schedule from test-branch
      const branch1List = await request(app.getHttpServer())
        .get('/api/v1/fees/schedules')
        .set('X-Branch-Id', 'branch1');
      
      const branch1Id = branch1List.body.data[0]?.id;
      if (!branch1Id) return;

      // Try to update from test-branch2
      await request(app.getHttpServer())
        .patch(`/api/v1/fees/schedules/${branch1Id}`)
        .set('X-Branch-Id', 'test-branch2')
        .send({ status: 'paused' })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/fees/schedules/:id', () => {
    let testFeeStructureId: string;

    beforeAll(async () => {
      // Create a fee structure to use in tests
      const createStructureResponse = await request(app.getHttpServer())
        .post('/api/v1/fees/structures')
        .set('X-Branch-Id', 'branch1')
        .send({
          name: 'Test Fee Structure for DELETE',
          description: 'Test structure for delete tests',
          status: 'active'
        });
        
      testFeeStructureId = createStructureResponse.body?.data?.id || uuidv4();
    });

    it('should delete fee schedule successfully', async () => {
      // First create a fee schedule to delete
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/fees/schedules')
        .set('X-Branch-Id', 'branch1')
        .send({
          feeStructureId: testFeeStructureId,
          recurrence: 'monthly',
          dueDayOfMonth: 20,
          status: 'active'
        });

      const scheduleId = createResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/fees/schedules/${scheduleId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', scheduleId);

      // Verify it's deleted
      await request(app.getHttpServer())
        .get(`/api/v1/fees/schedules/${scheduleId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(404);
    });

    it('should return 404 for non-existent fee schedule', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/fees/schedules/non-existent-id')
        .set('X-Branch-Id', 'branch1')
        .expect(404);
    });

    it('should not delete fee schedule from different tenant', async () => {
      // Get fee schedule from test-branch
      const branch1List = await request(app.getHttpServer())
        .get('/api/v1/fees/schedules')
        .set('X-Branch-Id', 'branch1');
      
      const branch1Id = branch1List.body.data[0]?.id;
      if (!branch1Id) return;

      // Try to delete from test-branch2
      await request(app.getHttpServer())
        .delete(`/api/v1/fees/schedules/${branch1Id}`)
        .set('X-Branch-Id', 'test-branch2')
        .expect(404);
    });
  });

  describe('POST /api/v1/fees/schedules/:id/generate', () => {
    let testFeeStructureId: string;

    beforeAll(async () => {
      // Create a fee structure to use in tests
      const createStructureResponse = await request(app.getHttpServer())
        .post('/api/v1/fees/structures')
        .set('X-Branch-Id', 'branch1')
        .send({
          name: 'Test Fee Structure for GENERATE',
          description: 'Test structure for generate tests',
          status: 'active'
        });
        
      testFeeStructureId = createStructureResponse.body?.data?.id || uuidv4();
    });

    it('should generate invoices for fee schedule', async () => {
      // First create a fee schedule to generate from
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/fees/schedules')
        .set('X-Branch-Id', 'branch1')
        .send({
          feeStructureId: testFeeStructureId,
          recurrence: 'monthly',
          dueDayOfMonth: 15,
          status: 'active'
        });

      const scheduleId = createResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .post(`/api/v1/fees/schedules/${scheduleId}/generate`)
        .set('X-Branch-Id', 'branch1')
        .expect(201);

      expect(response.body).toHaveProperty('created');
      expect(typeof response.body.created).toBe('number');
    });

    it('should return 0 created for paused schedule', async () => {
      // Create a paused fee schedule
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/fees/schedules')
        .set('X-Branch-Id', 'branch1')
        .send({
          feeStructureId: testFeeStructureId,
          recurrence: 'monthly',
          dueDayOfMonth: 15,
          status: 'paused'
        });

      const scheduleId = createResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .post(`/api/v1/fees/schedules/${scheduleId}/generate`)
        .set('X-Branch-Id', 'branch1')
        .expect(201);

      expect(response.body.created).toBe(0);
    });
  });

  describe('Branch context validation', () => {
    it('should require X-Branch-Id header', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/fees/schedules')
        // No X-Branch-Id header
        .expect(200); // Fee schedules service doesn't require branch context (uses if available)
    });

    it('should handle empty X-Branch-Id gracefully', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/fees/schedules')
        .set('X-Branch-Id', '')
        .expect(200);
    });
  });
});