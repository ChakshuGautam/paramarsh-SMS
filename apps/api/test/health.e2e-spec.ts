import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Health API (e2e)', () => {
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

  describe('GET /api/v1/health', () => {
    it('should return health status with correct format', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('ts');
      expect(response.body.status).toBe('ok');
      expect(typeof response.body.ts).toBe('string');
      
      // Verify timestamp is a valid ISO string
      const timestamp = new Date(response.body.ts);
      expect(timestamp.toISOString()).toBe(response.body.ts);
    });

    it('should return current timestamp', async () => {
      const beforeRequest = Date.now();
      
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      const afterRequest = Date.now();
      const responseTime = new Date(response.body.ts).getTime();
      
      // Timestamp should be between before and after request
      expect(responseTime).toBeGreaterThanOrEqual(beforeRequest);
      expect(responseTime).toBeLessThanOrEqual(afterRequest);
    });

    it('should not require authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health');

      expect(response.status).toBe(200);
    });

    it('should not require branch header', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });

    it('should be consistent across multiple requests', async () => {
      const responses = await Promise.all([
        request(app.getHttpServer()).get('/api/v1/health'),
        request(app.getHttpServer()).get('/api/v1/health'),
        request(app.getHttpServer()).get('/api/v1/health')
      ]);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
        expect(response.body).toHaveProperty('ts');
      });
    });

    it('should handle HEAD requests', async () => {
      const response = await request(app.getHttpServer())
        .head('/api/v1/health');

      expect([200, 405]).toContain(response.status);
    });

    it('should handle OPTIONS requests', async () => {
      const response = await request(app.getHttpServer())
        .options('/api/v1/health');

      expect([200, 204, 404, 405]).toContain(response.status);
    });

    it('should not accept POST requests', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/health')
        .send({});

      expect([404, 405]).toContain(response.status);
    });

    it('should not accept PUT requests', async () => {
      const response = await request(app.getHttpServer())
        .put('/api/v1/health')
        .send({});

      expect([404, 405]).toContain(response.status);
    });

    it('should not accept DELETE requests', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/v1/health');

      expect([404, 405]).toContain(response.status);
    });

    it('should respond quickly', async () => {
      const startTime = Date.now();
      
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      const responseTime = Date.now() - startTime;
      
      // Health check should respond in under 1 second
      expect(responseTime).toBeLessThan(1000);
      expect(response.body.status).toBe('ok');
    });

    it('should include proper content-type header', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should handle query parameters gracefully', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health?check=detailed&format=json')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('ts');
    });

    it('should handle malformed path segments', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health/');

      expect([200, 404]).toContain(response.status);
    });

    it('should handle health with trailing slash', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health/');

      expect([200, 404]).toContain(response.status);
    });

    it('should maintain uptime information', async () => {
      // Make multiple requests to ensure service stays up
      for (let i = 0; i < 5; i++) {
        const response = await request(app.getHttpServer())
          .get('/api/v1/health')
          .expect(200);

        expect(response.body.status).toBe('ok');
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    });
  });

  describe('Health API reliability', () => {
    it('should handle multiple sequential requests', async () => {
      const responses = [];
      
      for (let i = 0; i < 5; i++) {
        const response = await request(app.getHttpServer())
          .get('/api/v1/health')
          .expect(200);
        responses.push(response);
      }
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
        expect(response.body).toHaveProperty('ts');
      });
    });

    it('should be consistently available', async () => {
      const startTime = Date.now();
      const responses = [];
      
      for (let i = 0; i < 10; i++) {
        const response = await request(app.getHttpServer())
          .get('/api/v1/health')
          .expect(200);
        responses.push(response);
      }
      
      const totalTime = Date.now() - startTime;
      
      expect(responses.length).toBe(10);
      expect(totalTime).toBeLessThan(5000); // Should complete in under 5 seconds
      
      responses.forEach(response => {
        expect(response.body.status).toBe('ok');
      });
    });
  });
});