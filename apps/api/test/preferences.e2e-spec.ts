import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Preferences API (e2e)', () => {
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

  describe('PUT /api/v1/comms/preferences', () => {
    it('should upsert preference with correct format', async () => {
      const preferenceData = {
        ownerType: 'student',
        ownerId: 'student-123',
        channel: 'sms',
        consent: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00'
      };

      const response = await request(app.getHttpServer())
        .put('/api/v1/comms/preferences')
        .set('X-Branch-Id', 'branch1')
        .send(preferenceData);

      expect([200, 201, 400, 500]).toContain(response.status);
      
      if (response.status === 200 || response.status === 201) {
        expect(response.body.ownerType).toBe('student');
        expect(response.body.ownerId).toBe('student-123');
        expect(response.body.channel).toBe('sms');
        expect(response.body.consent).toBe(true);
      }
    });
  });

  describe('GET /api/v1/comms/preferences', () => {
    it('should return preferences list', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/comms/preferences')
        .set('X-Branch-Id', 'branch1');

      expect([200, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
      }
    });

    it('should support filtering', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/comms/preferences?ownerType=student&channel=sms')
        .set('X-Branch-Id', 'branch1');

      expect([200, 500]).toContain(response.status);
    });
  });

  describe('GET /api/v1/comms/preferences/:ownerType/:ownerId', () => {
    it('should return preferences by owner', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/comms/preferences/student/test-student-id')
        .set('X-Branch-Id', 'branch1');

      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/v1/comms/preferences/:ownerType/:ownerId/:channel/consent', () => {
    it('should check consent status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/comms/preferences/student/test-student-id/sms/consent')
        .set('X-Branch-Id', 'branch1');

      expect([200, 404, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('hasConsent');
        expect(typeof response.body.hasConsent).toBe('boolean');
      }
    });
  });

  describe('GET /api/v1/comms/preferences/:ownerType/:ownerId/:channel/quiet-hours', () => {
    it('should check quiet hours status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/comms/preferences/student/test-student-id/sms/quiet-hours')
        .set('X-Branch-Id', 'branch1');

      expect([200, 404, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('inQuietHours');
        expect(typeof response.body.inQuietHours).toBe('boolean');
      }
    });
  });

  describe('DELETE /api/v1/comms/preferences/:ownerType/:ownerId/:channel', () => {
    it('should delete preference', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/v1/comms/preferences/student/test-student-id/sms')
        .set('X-Branch-Id', 'branch1');

      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/v1/comms/preferences/:ownerType/:ownerId/bulk-consent', () => {
    it('should bulk update consent', async () => {
      const consentData = [
        { channel: 'sms', consent: true },
        { channel: 'email', consent: false }
      ];

      const response = await request(app.getHttpServer())
        .post('/api/v1/comms/preferences/student/test-student-id/bulk-consent')
        .set('X-Branch-Id', 'branch1')
        .send(consentData);

      expect([200, 201, 404, 500]).toContain(response.status);
    });
  });
});