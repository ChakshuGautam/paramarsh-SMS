import request = require('supertest');
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

function jwt(payload: any): string {
  const base64 = (o: any) => Buffer.from(JSON.stringify(o)).toString('base64url');
  // unsigned dev token; guard only inspects payload
  return `${base64({ alg: 'none', typ: 'JWT' })}.${base64(payload)}.`;
}

describe('BranchGuard + scoping (E2E)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    http = request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  const teacherToken = jwt({ sub: 'u1', roles: ['teacher'], branchIds: ['b1', 'b2'] });
  const adminToken = jwt({ sub: 'admin', roles: ['admin'] });

  it('403 when teacher selects unauthorized branch', async () => {
    await http
      .get('/api/v1/students')
      .set('Authorization', `Bearer ${teacherToken}`)
      .set('X-Branch-Id', 'b3')
      .expect(403);
  });

  it('200 when teacher selects allowed branch', async () => {
    await http
      .get('/api/v1/students')
      .set('Authorization', `Bearer ${teacherToken}`)
      .set('X-Branch-Id', 'b1')
      .expect(200);
  });

  it('admin bypasses guard but still can scope via header', async () => {
    await http.get('/api/v1/students').set('Authorization', `Bearer ${adminToken}`).expect(200);
  });
});
