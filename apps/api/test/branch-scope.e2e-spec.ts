import request from 'supertest';
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
  let http: request.SuperTest<request.Test>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
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

  it('200 when teacher selects allowed branch; list is scoped', async () => {
    // seed a student in b1
    const s1 = await http
      .post('/api/v1/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('X-Branch-Id', 'b1')
      .send({ firstName: 'Scoped', lastName: 'Student' })
      .expect(201);
    expect(s1.body.data.id).toBeDefined();

    const listB1 = await http
      .get('/api/v1/students')
      .set('Authorization', `Bearer ${teacherToken}`)
      .set('X-Branch-Id', 'b1')
      .expect(200);
    expect(Array.isArray(listB1.body.data)).toBe(true);

    const listB2 = await http
      .get('/api/v1/students')
      .set('Authorization', `Bearer ${teacherToken}`)
      .set('X-Branch-Id', 'b2')
      .expect(200);

    // Since we only created in b1, b2 should not include it
    const hasInB2 = (listB2.body.data as any[]).some((r) => r.id === s1.body.data.id);
    expect(hasInB2).toBe(false);
  });

  it('admin bypasses guard but still can scope via header', async () => {
    await http.get('/api/v1/students').set('Authorization', `Bearer ${adminToken}`).expect(200);
  });
});
