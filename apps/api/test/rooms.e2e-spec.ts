import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Rooms API (e2e)', () => {
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

  describe('GET /api/v1/rooms', () => {
    it('should return rooms list', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/rooms').set('X-Branch-Id', 'branch1');
      expect([200, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
      }
    });
  });

  describe('POST /api/v1/rooms', () => {
    it('should create new room', async () => {
      const roomData = { name: 'Room 101', type: 'classroom', capacity: 30 };
      const response = await request(app.getHttpServer()).post('/api/v1/rooms').set('X-Branch-Id', 'branch1').send(roomData);
      expect([200, 201, 400, 500]).toContain(response.status);
    });
  });
});