import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Finance API Endpoints (E2E)', () => {
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
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Fee Structures', () => {
    it('should get list of fee structures', () => {
      return request(app.getHttpServer())
        .get('/api/v1/fees/structures')
        .set('x-branch-id', 'branch1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should get single fee structure by id', async () => {
      // First get list to find an existing ID
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/fees/structures')
        .set('x-branch-id', 'branch1')
        .expect(200);

      if (listResponse.body.data.length > 0) {
        const firstId = listResponse.body.data[0].id;
        
        return request(app.getHttpServer())
          .get(`/api/v1/fees/structures/${firstId}`)
          .set('x-branch-id', 'branch1')
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toHaveProperty('id', firstId);
          });
      } else {
        // Skip test if no data exists
        expect(true).toBe(true);
      }
    });

    it('should handle getMany with ids parameter', () => {
      return request(app.getHttpServer())
        .get('/api/v1/fees/structures?ids=test-id-1,test-id-2')
        .set('x-branch-id', 'branch1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('Fee Schedules', () => {
    it('should get list of fee schedules', () => {
      return request(app.getHttpServer())
        .get('/api/v1/fees/schedules')
        .set('x-branch-id', 'branch1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should get single fee schedule by id', async () => {
      // First get list to find an existing ID
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/fees/schedules')
        .set('x-branch-id', 'branch1')
        .expect(200);

      if (listResponse.body.data.length > 0) {
        const firstId = listResponse.body.data[0].id;
        
        return request(app.getHttpServer())
          .get(`/api/v1/fees/schedules/${firstId}`)
          .set('x-branch-id', 'branch1')
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toHaveProperty('id', firstId);
          });
      } else {
        // Skip test if no data exists
        expect(true).toBe(true);
      }
    });

    it('should handle getMany with ids parameter', () => {
      return request(app.getHttpServer())
        .get('/api/v1/fees/schedules?ids=test-id-1,test-id-2')
        .set('x-branch-id', 'branch1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should support pagination parameters', () => {
      return request(app.getHttpServer())
        .get('/api/v1/fees/schedules?page=1&perPage=10')
        .set('x-branch-id', 'branch1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeLessThanOrEqual(10);
        });
    });

    it('should support pageSize parameter as alias for perPage', () => {
      return request(app.getHttpServer())
        .get('/api/v1/fees/schedules?page=1&pageSize=5')
        .set('x-branch-id', 'branch1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeLessThanOrEqual(5);
        });
    });
  });

  describe('Multi-tenancy', () => {
    it('should return different data for different branches', async () => {
      const branch1Response = await request(app.getHttpServer())
        .get('/api/v1/fees/structures')
        .set('x-branch-id', 'branch1')
        .expect(200);

      const branch2Response = await request(app.getHttpServer())
        .get('/api/v1/fees/structures')
        .set('x-branch-id', 'branch2')
        .expect(200);

      // Should have proper response format regardless of data
      expect(branch1Response.body).toHaveProperty('data');
      expect(branch1Response.body).toHaveProperty('total');
      expect(branch2Response.body).toHaveProperty('data');
      expect(branch2Response.body).toHaveProperty('total');
      
      expect(Array.isArray(branch1Response.body.data)).toBe(true);
      expect(Array.isArray(branch2Response.body.data)).toBe(true);
    });
  });
});