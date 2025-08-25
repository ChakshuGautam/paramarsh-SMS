import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { DEFAULT_BRANCH_ID } from '../src/common/constants';

describe('Invoices (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Case-Insensitive Status Filtering', () => {
    it('should return invoices when filtering by lowercase status', async () => {
      const response = await request(app.getHttpServer())
        .get('/invoices?status=pending')
        .set('x-branch-id', DEFAULT_BRANCH_ID)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Should return invoices with PENDING status
      if (response.body.data.length > 0) {
        const hasUppercaseStatus = response.body.data.some(
          (invoice: any) => invoice.status === 'PENDING'
        );
        expect(hasUppercaseStatus).toBe(true);
      }
    });

    it('should return invoices when filtering by uppercase status', async () => {
      const response = await request(app.getHttpServer())
        .get('/invoices?status=PENDING')
        .set('x-branch-id', DEFAULT_BRANCH_ID)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Should return invoices with PENDING status
      if (response.body.data.length > 0) {
        const hasCorrectStatus = response.body.data.every(
          (invoice: any) => invoice.status?.toUpperCase() === 'PENDING'
        );
        expect(hasCorrectStatus).toBe(true);
      }
    });

    it('should return same results for lowercase and uppercase status filters', async () => {
      const [lowercaseResponse, uppercaseResponse] = await Promise.all([
        request(app.getHttpServer())
          .get('/invoices?status=pending')
          .set('x-branch-id', DEFAULT_BRANCH_ID),
        request(app.getHttpServer())
          .get('/invoices?status=PENDING')
          .set('x-branch-id', DEFAULT_BRANCH_ID)
      ]);

      expect(lowercaseResponse.status).toBe(200);
      expect(uppercaseResponse.status).toBe(200);
      
      // Both should return the same total count
      expect(lowercaseResponse.body.total).toBe(uppercaseResponse.body.total);
      expect(lowercaseResponse.body.data.length).toBe(uppercaseResponse.body.data.length);
    });

    it('should work with other status values - PAID', async () => {
      const [lowercaseResponse, uppercaseResponse] = await Promise.all([
        request(app.getHttpServer())
          .get('/invoices?status=paid')
          .set('x-branch-id', DEFAULT_BRANCH_ID),
        request(app.getHttpServer())
          .get('/invoices?status=PAID')
          .set('x-branch-id', DEFAULT_BRANCH_ID)
      ]);

      expect(lowercaseResponse.status).toBe(200);
      expect(uppercaseResponse.status).toBe(200);
      
      // Both should return the same total count
      expect(lowercaseResponse.body.total).toBe(uppercaseResponse.body.total);
    });

    it('should work with other status values - OVERDUE', async () => {
      const [lowercaseResponse, uppercaseResponse] = await Promise.all([
        request(app.getHttpServer())
          .get('/invoices?status=overdue')
          .set('x-branch-id', DEFAULT_BRANCH_ID),
        request(app.getHttpServer())
          .get('/invoices?status=OVERDUE')
          .set('x-branch-id', DEFAULT_BRANCH_ID)
      ]);

      expect(lowercaseResponse.status).toBe(200);
      expect(uppercaseResponse.status).toBe(200);
      
      // Both should return the same total count
      expect(lowercaseResponse.body.total).toBe(uppercaseResponse.body.total);
    });

    it('should work with other status values - CANCELLED', async () => {
      const [lowercaseResponse, uppercaseResponse] = await Promise.all([
        request(app.getHttpServer())
          .get('/invoices?status=cancelled')
          .set('x-branch-id', DEFAULT_BRANCH_ID),
        request(app.getHttpServer())
          .get('/invoices?status=CANCELLED')
          .set('x-branch-id', DEFAULT_BRANCH_ID)
      ]);

      expect(lowercaseResponse.status).toBe(200);
      expect(uppercaseResponse.status).toBe(200);
      
      // Both should return the same total count
      expect(lowercaseResponse.body.total).toBe(uppercaseResponse.body.total);
    });

    it('should work with mixed case status values', async () => {
      const response = await request(app.getHttpServer())
        .get('/invoices?status=Pending')
        .set('x-branch-id', DEFAULT_BRANCH_ID)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      
      // Should return invoices with PENDING status (case-insensitive)
      if (response.body.data.length > 0) {
        const hasCorrectStatus = response.body.data.every(
          (invoice: any) => invoice.status?.toUpperCase() === 'PENDING'
        );
        expect(hasCorrectStatus).toBe(true);
      }
    });

    it('should work with filter parameter (React Admin format)', async () => {
      const filter = JSON.stringify({ status: 'pending' });
      const response = await request(app.getHttpServer())
        .get(`/invoices?filter=${encodeURIComponent(filter)}`)
        .set('x-branch-id', DEFAULT_BRANCH_ID)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      
      // Should return invoices with PENDING status
      if (response.body.data.length > 0) {
        const hasCorrectStatus = response.body.data.every(
          (invoice: any) => invoice.status?.toUpperCase() === 'PENDING'
        );
        expect(hasCorrectStatus).toBe(true);
      }
    });

    it('should maintain multi-tenancy with case-insensitive status filtering', async () => {
      const response = await request(app.getHttpServer())
        .get('/invoices?status=pending')
        .set('x-branch-id', 'branch2')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      
      // All invoices should belong to branch2 students
      if (response.body.data.length > 0) {
        // Verify by checking that all students have the correct branchId
        const invoiceIds = response.body.data.map((inv: any) => inv.id);
        
        if (invoiceIds.length > 0) {
          const invoicesWithStudents = await prisma.invoice.findMany({
            where: { id: { in: invoiceIds } },
            include: { student: true }
          });
          
          const allFromCorrectBranch = invoicesWithStudents.every(
            inv => inv.student.branchId === 'branch2'
          );
          expect(allFromCorrectBranch).toBe(true);
        }
      }
    });

    it('should work with pagination and case-insensitive status filtering', async () => {
      const response = await request(app.getHttpServer())
        .get('/invoices?status=pending&page=1&perPage=5')
        .set('x-branch-id', DEFAULT_BRANCH_ID)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      
      // Should return invoices with correct status
      if (response.body.data.length > 0) {
        const hasCorrectStatus = response.body.data.every(
          (invoice: any) => invoice.status?.toUpperCase() === 'PENDING'
        );
        expect(hasCorrectStatus).toBe(true);
      }
    });

    it('should work with sorting and case-insensitive status filtering', async () => {
      const response = await request(app.getHttpServer())
        .get('/invoices?status=pending&sort=amount&perPage=10')
        .set('x-branch-id', DEFAULT_BRANCH_ID)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      
      // Should return invoices with correct status
      if (response.body.data.length > 0) {
        const hasCorrectStatus = response.body.data.every(
          (invoice: any) => invoice.status?.toUpperCase() === 'PENDING'
        );
        expect(hasCorrectStatus).toBe(true);
      }
    });
  });

  describe('Enhanced Calculated Fields', () => {
    it('should include calculated fields (isOverdue, daysPastDue) in response', async () => {
      const response = await request(app.getHttpServer())
        .get('/invoices?perPage=5')
        .set('x-branch-id', DEFAULT_BRANCH_ID)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      
      if (response.body.data.length > 0) {
        const invoice = response.body.data[0];
        expect(invoice).toHaveProperty('isOverdue');
        expect(invoice).toHaveProperty('daysPastDue');
        expect(typeof invoice.isOverdue).toBe('boolean');
        expect(typeof invoice.daysPastDue).toBe('number');
      }
    });
  });

  describe('Basic CRUD Operations', () => {
    it('should list invoices with React Admin format', async () => {
      const response = await request(app.getHttpServer())
        .get('/invoices')
        .set('x-branch-id', DEFAULT_BRANCH_ID)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(typeof response.body.total).toBe('number');
    });

    it('should get a single invoice', async () => {
      // First get a list to find an invoice ID
      const listResponse = await request(app.getHttpServer())
        .get('/invoices?perPage=1')
        .set('x-branch-id', DEFAULT_BRANCH_ID);

      if (listResponse.body.data.length > 0) {
        const invoiceId = listResponse.body.data[0].id;
        
        const response = await request(app.getHttpServer())
          .get(`/invoices/${invoiceId}`)
          .set('x-branch-id', DEFAULT_BRANCH_ID)
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('id', invoiceId);
      }
    });

    it('should support search functionality', async () => {
      const response = await request(app.getHttpServer())
        .get('/invoices?q=2024')
        .set('x-branch-id', DEFAULT_BRANCH_ID)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/invoices?page=1&perPage=10')
        .set('x-branch-id', DEFAULT_BRANCH_ID)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });

    it('should support getMany (ids parameter)', async () => {
      // First get some invoice IDs
      const listResponse = await request(app.getHttpServer())
        .get('/invoices?perPage=3')
        .set('x-branch-id', DEFAULT_BRANCH_ID);

      if (listResponse.body.data.length >= 2) {
        const ids = listResponse.body.data.slice(0, 2).map((inv: any) => inv.id);
        
        const response = await request(app.getHttpServer())
          .get(`/invoices?ids=${ids.join(',')}`)
          .set('x-branch-id', DEFAULT_BRANCH_ID)
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(response.body.data.length).toBe(2);
        expect(response.body.data.every((inv: any) => ids.includes(inv.id))).toBe(true);
      }
    });
  });
});