import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Tenants API (e2e)', () => {
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

  describe('GET /api/v1/tenants', () => {
    it('should return paginated list with correct format', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/tenants?page=1&pageSize=5')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(typeof response.body.meta.total).toBe('number');
      expect(response.body.meta).toHaveProperty('page', 1);
      expect(response.body.meta).toHaveProperty('pageSize', 5);

      if (response.body.data.length > 0) {
        const tenant = response.body.data[0];
        expect(tenant).toHaveProperty('name');
        expect(tenant).toHaveProperty('subdomain');
        expect(typeof tenant.name).toBe('string');
        expect(typeof tenant.subdomain).toBe('string');
      }
    });

    it('should support ascending sorting by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/tenants?sort=name')
        .expect(200);

      const names = response.body.data.map(item => item.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    it('should support descending sorting by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/tenants?sort=-name')
        .expect(200);

      const names = response.body.data.map(item => item.name);
      const sortedNames = [...names].sort().reverse();
      expect(names).toEqual(sortedNames);
    });

    it('should support ascending sorting by subdomain', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/tenants?sort=subdomain')
        .expect(200);

      const subdomains = response.body.data.map(item => item.subdomain);
      const sortedSubdomains = [...subdomains].sort();
      expect(subdomains).toEqual(sortedSubdomains);
    });

    it('should support search by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/tenants?q=school')
        .expect(200);

      response.body.data.forEach(item => {
        const lowerName = item.name.toLowerCase();
        const lowerSubdomain = item.subdomain.toLowerCase();
        expect(
          lowerName.includes('school') || lowerSubdomain.includes('school')
        ).toBe(true);
      });
    });

    it('should support search by subdomain', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/tenants?q=edu')
        .expect(200);

      response.body.data.forEach(item => {
        const lowerName = item.name.toLowerCase();
        const lowerSubdomain = item.subdomain.toLowerCase();
        expect(
          lowerName.includes('edu') || lowerSubdomain.includes('edu')
        ).toBe(true);
      });
    });

    it('should handle pagination correctly', async () => {
      const page1 = await request(app.getHttpServer())
        .get('/api/v1/tenants?page=1&pageSize=2')
        .expect(200);

      const page2 = await request(app.getHttpServer())
        .get('/api/v1/tenants?page=2&pageSize=2')
        .expect(200);

      // Verify pagination metadata
      expect(page1.body.meta.page).toBe(1);
      expect(page2.body.meta.page).toBe(2);
      expect(page1.body.meta.pageSize).toBe(2);
      expect(page2.body.meta.pageSize).toBe(2);

      // Verify no overlap if both pages have data
      if (page1.body.data.length > 0 && page2.body.data.length > 0) {
        const page1Names = page1.body.data.map(item => item.name);
        const page2Names = page2.body.data.map(item => item.name);
        const overlap = page1Names.filter(name => page2Names.includes(name));
        expect(overlap.length).toBe(0);
      }
    });

    it('should respect pageSize limits', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/tenants?pageSize=1000')
        .expect(200);

      // Service limits pageSize to 200
      expect(response.body.data.length).toBeLessThanOrEqual(200);
      expect(response.body.meta.pageSize).toBe(200);
    });

    it('should handle empty search results', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/tenants?q=nonexistentschool12345')
        .expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.meta.total).toBe(0);
    });

    it('should handle multiple sort fields', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/tenants?sort=name,subdomain')
        .expect(200);

      // Verify response is still valid
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return hasNext metadata correctly', async () => {
      const totalResponse = await request(app.getHttpServer())
        .get('/api/v1/tenants?pageSize=1000')
        .expect(200);

      const total = totalResponse.body.meta.total;

      if (total > 1) {
        // Get first page with pageSize = 1
        const firstPageResponse = await request(app.getHttpServer())
          .get('/api/v1/tenants?page=1&pageSize=1')
          .expect(200);

        expect(firstPageResponse.body.meta.hasNext).toBe(true);

        // Get last page
        const lastPage = Math.ceil(total / 1);
        const lastPageResponse = await request(app.getHttpServer())
          .get(`/api/v1/tenants?page=${lastPage}&pageSize=1`)
          .expect(200);

        expect(lastPageResponse.body.meta.hasNext).toBe(false);
      }
    });
  });

  describe('Tenant-specific functionality', () => {
    it('should load tenants from CSV file if available', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/tenants')
        .expect(200);

      // Should return data (empty array if no CSV file, or actual data if CSV exists)
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta.total).toBeGreaterThanOrEqual(0);
    });

    it('should have consistent data structure for all tenants', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/tenants')
        .expect(200);

      response.body.data.forEach(tenant => {
        expect(tenant).toHaveProperty('name');
        expect(tenant).toHaveProperty('subdomain');
        expect(typeof tenant.name).toBe('string');
        expect(typeof tenant.subdomain).toBe('string');
        expect(tenant.name.length).toBeGreaterThan(0);
        expect(tenant.subdomain.length).toBeGreaterThan(0);
      });
    });

    it('should have unique subdomains', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/tenants')
        .expect(200);

      const subdomains = response.body.data.map(tenant => tenant.subdomain);
      const uniqueSubdomains = new Set(subdomains);
      expect(subdomains.length).toBe(uniqueSubdomains.size);
    });

    it('should handle case-insensitive search', async () => {
      const lowerResponse = await request(app.getHttpServer())
        .get('/api/v1/tenants?q=school')
        .expect(200);

      const upperResponse = await request(app.getHttpServer())
        .get('/api/v1/tenants?q=SCHOOL')
        .expect(200);

      // Should return same results regardless of case
      expect(lowerResponse.body.data.length).toBe(upperResponse.body.data.length);
      expect(lowerResponse.body.meta.total).toBe(upperResponse.body.meta.total);
    });
  });
});