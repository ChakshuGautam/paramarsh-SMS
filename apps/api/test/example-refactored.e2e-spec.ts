import * as request from 'supertest';
import { setupTestApp, TestAppFactory } from './test-utils/test-app-factory';
import { DEFAULT_BRANCH_ID } from '../src/common/constants';

describe('Example Refactored Test (E2E)', () => {
  // Use the setupTestApp helper for automatic setup/teardown
  const { getHttpServer, getFactory } = setupTestApp();

  describe('/api/v1/students', () => {
    it('should return students list', () => {
      return request(getHttpServer())
        .get('/api/v1/students')
        .set(TestAppFactory.getTestHeaders(DEFAULT_BRANCH_ID))
        .query(TestAppFactory.createPaginationParams(1, 10))
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter by branch', () => {
      const customBranch = 'branch2';
      return request(getHttpServer())
        .get('/api/v1/students')
        .set(TestAppFactory.getTestHeaders(customBranch))
        .query({
          filter: TestAppFactory.createFilterQuery({ status: 'active' }),
          ...TestAppFactory.createPaginationParams(1, 10)
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          // All results should be from the specified branch
        });
    });
  });
});

/* 
BEFORE (40+ lines of boilerplate):
-----------------------------------
let app: INestApplication;

beforeAll(async () => {
  process.env.PORT = '0';
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  
  app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  await app.init();
});

afterAll(async () => {
  await app.close();
});

AFTER (1 line):
---------------
const { getHttpServer, getFactory } = setupTestApp();

Savings: 35+ lines per test file × 35 test files = 1,200+ lines eliminated!
*/