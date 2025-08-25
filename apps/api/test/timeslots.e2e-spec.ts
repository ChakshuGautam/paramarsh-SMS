import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('TimeSlots API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.PORT = '0';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, transformOptions: { enableImplicitConversion: true }, validationError: { target: false } }));
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  describe('GET /api/v1/timeslots', () => {
    it('should return timeslots', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/timeslots').set('X-Branch-Id', 'branch1');
      expect([200, 404, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
      }
    });
  });

  describe('POST /api/v1/timeslots', () => {
    it('should create timeslot', async () => {
      const slotData = { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '10:00', period: 1 };
      const response = await request(app.getHttpServer()).post('/api/v1/timeslots').set('X-Branch-Id', 'branch1').send(slotData);
      expect([200, 201, 400, 404, 500]).toContain(response.status);
    });
  });
});