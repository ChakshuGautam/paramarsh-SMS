import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Fee Structures API (e2e)', () => {
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
    
    // IMPORTANT: Tests rely on seed data from apps/api/prisma/seed.ts
    // The seed script creates data for 'branch1' tenant
    // Run: cd apps/api && npx prisma db seed
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/fees/structures', () => {
    it('should return paginated list with correct format', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/fees/structures?page=1&pageSize=5')
        .set('X-Branch-Id', 'branch1')
        .expect(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(typeof response.body.total).toBe('number');
    });

    it('should isolate data between tenants', async () => {
      const [branch1Response, branch2Response] = await Promise.all([
        request(app.getHttpServer())
          .get('/api/v1/fees/structures')
          .set('X-Branch-Id', 'branch1'),
        request(app.getHttpServer())
          .get('/api/v1/fees/structures')
          .set('X-Branch-Id', 'branch2')
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
    });

    it('should support ascending sorting', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/fees/structures?sort=id')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      if (response.body.data.length > 1) {
        const ids = response.body.data.map(item => item.id);
        const sortedIds = [...ids].sort();
        expect(ids).toEqual(sortedIds);
      }
    });

    it('should support descending sorting', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/fees/structures?sort=-id')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      if (response.body.data.length > 1) {
        const ids = response.body.data.map(item => item.id);
        const sortedIds = [...ids].sort().reverse();
        expect(ids).toEqual(sortedIds);
      }
    });

    it('should handle pagination correctly', async () => {
      const page1 = await request(app.getHttpServer())
        .get('/api/v1/fees/structures?page=1&pageSize=2')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      if (page1.body.total > 2) {
        const page2 = await request(app.getHttpServer())
          .get('/api/v1/fees/structures?page=2&pageSize=2')
          .set('X-Branch-Id', 'branch1')
          .expect(200);

        // Verify no overlap
        const page1Ids = page1.body.data.map(item => item.id);
        const page2Ids = page2.body.data.map(item => item.id);
        const overlap = page1Ids.filter(id => page2Ids.includes(id));
        
        expect(overlap.length).toBe(0);
      }
    });

    it('should include components in the response', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/fees/structures')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      if (response.body.data.length > 0) {
        const structure = response.body.data[0];
        expect(structure).toHaveProperty('components');
        expect(Array.isArray(structure.components)).toBe(true);
      }
    });
  });

  describe('POST /api/v1/fees/structures', () => {
    it('should create new fee structure with correct format', async () => {
      // First get a class ID for the structure
      const classesResponse = await request(app.getHttpServer())
        .get('/api/v1/classes')
        .set('X-Branch-Id', 'branch1');
      
      const classId = classesResponse.body.data[0]?.id;

      const newStructure = {
        gradeId: classId
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/fees/structures')
        .set('X-Branch-Id', 'branch1')
        .send(newStructure)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.gradeId).toBe(classId);
    });

    it('should create fee structure without gradeId', async () => {
      const newStructure = {};

      const response = await request(app.getHttpServer())
        .post('/api/v1/fees/structures')
        .set('X-Branch-Id', 'branch1')
        .send(newStructure)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
    });
  });

  describe('PATCH /api/v1/fees/structures/:id', () => {
    it('should update fee structure with correct format', async () => {
      // First create a structure
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/fees/structures')
        .set('X-Branch-Id', 'branch1')
        .send({});

      const structureId = createResponse.body.data.id;

      // Get a class ID for the update
      const classesResponse = await request(app.getHttpServer())
        .get('/api/v1/classes')
        .set('X-Branch-Id', 'branch1');
      
      const classId = classesResponse.body.data[0]?.id;

      const updateData = {
        gradeId: classId
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/fees/structures/${structureId}`)
        .set('X-Branch-Id', 'branch1')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.gradeId).toBe(classId);
      expect(response.body.data.id).toBe(structureId);
    });

    it('should return 404 for non-existent structure', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/fees/structures/non-existent-id')
        .set('X-Branch-Id', 'branch1')
        .send({ gradeId: null })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/fees/structures/:id', () => {
    it('should delete fee structure with correct format', async () => {
      // First create a structure
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/fees/structures')
        .set('X-Branch-Id', 'branch1')
        .send({});

      const structureId = createResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/fees/structures/${structureId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent structure', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/fees/structures/non-existent-id')
        .set('X-Branch-Id', 'branch1')
        .expect(404);
    });
  });

  describe('POST /api/v1/fees/structures/components', () => {
    it('should create new fee component with correct format', async () => {
      // First create a structure
      const structureResponse = await request(app.getHttpServer())
        .post('/api/v1/fees/structures')
        .set('X-Branch-Id', 'branch1')
        .send({});

      const structureId = structureResponse.body.data.id;

      const newComponent = {
        feeStructureId: structureId,
        name: 'Test Fee Component',
        type: 'academic',
        amount: 5000
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/fees/structures/components')
        .set('X-Branch-Id', 'branch1')
        .send(newComponent)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toMatchObject(newComponent);
    });

    it('should validate required fields for components', async () => {
      const invalidComponent = {
        name: 'Invalid Component'
        // Missing feeStructureId and amount
      };

      await request(app.getHttpServer())
        .post('/api/v1/fees/structures/components')
        .set('X-Branch-Id', 'branch1')
        .send(invalidComponent)
        .expect(400);
    });
  });

  describe('PATCH /api/v1/fees/structures/components/:id', () => {
    it('should update fee component with correct format', async () => {
      // First create a structure
      const structureResponse = await request(app.getHttpServer())
        .post('/api/v1/fees/structures')
        .set('X-Branch-Id', 'branch1')
        .send({});

      const structureId = structureResponse.body.data.id;

      // Create a component
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/fees/structures/components')
        .set('X-Branch-Id', 'branch1')
        .send({
          feeStructureId: structureId,
          name: 'Original Component',
          type: 'academic',
          amount: 5000
        });

      const componentId = createResponse.body.data.id;

      const updateData = {
        name: 'Updated Component',
        amount: 7500
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/fees/structures/components/${componentId}`)
        .set('X-Branch-Id', 'branch1')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.name).toBe('Updated Component');
      expect(response.body.data.amount).toBe(7500);
      expect(response.body.data.id).toBe(componentId);
    });

    it('should return 404 for non-existent component', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/fees/structures/components/non-existent-id')
        .set('X-Branch-Id', 'branch1')
        .send({ name: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/fees/structures/components/:id', () => {
    it('should delete fee component with correct format', async () => {
      // First create a structure
      const structureResponse = await request(app.getHttpServer())
        .post('/api/v1/fees/structures')
        .set('X-Branch-Id', 'branch1')
        .send({});

      const structureId = structureResponse.body.data.id;

      // Create a component
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/fees/structures/components')
        .set('X-Branch-Id', 'branch1')
        .send({
          feeStructureId: structureId,
          name: 'Component to Delete',
          type: 'academic',
          amount: 5000
        });

      const componentId = createResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/fees/structures/components/${componentId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent component', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/fees/structures/components/non-existent-id')
        .set('X-Branch-Id', 'branch1')
        .expect(404);
    });
  });
});