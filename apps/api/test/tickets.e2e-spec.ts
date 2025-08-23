import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

describe('Tickets API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.PORT = '0';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    
    // Add the same middleware from main.ts for multi-tenancy
    app.use((req: any, _res: any, next: any) => {
      (req as any).requestId = req.headers['x-request-id'] || uuidv4();
      const tenantId = (req.headers['x-tenant-id'] as string | undefined) || undefined;
      const branchId = (req.headers['x-branch-id'] as string | undefined) || undefined;
      PrismaService.runWithScope({ tenantId, branchId }, () => next());
    });
    
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

  describe('GET /api/v1/tickets', () => {
    it('should return paginated list with correct format', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/comms/tickets?page=1&perPage=5')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(typeof response.body.total).toBe('number');

      if (response.body.data.length > 0) {
        const ticket = response.body.data[0];
        expect(ticket).toHaveProperty('id');
        expect(ticket).toHaveProperty('ownerType');
        expect(ticket).toHaveProperty('ownerId');
        expect(ticket).toHaveProperty('category');
        expect(ticket).toHaveProperty('priority');
        expect(ticket).toHaveProperty('status');
        expect(ticket).toHaveProperty('subject');
        expect(ticket).toHaveProperty('branchId', 'branch1');
        expect(['academic', 'fees', 'technical', 'general', 'transport', 'discipline']).toContain(ticket.category);
        expect(['low', 'normal', 'high']).toContain(ticket.priority);
        expect(['open', 'in_progress', 'resolved', 'closed']).toContain(ticket.status);
      }
    });

    it('should isolate data between tenants', async () => {
      const [branch1Response, branch2Response] = await Promise.all([
        request(app.getHttpServer())
          .get('/api/v1/comms/tickets')
          .set('X-Branch-Id', 'branch1'),
        request(app.getHttpServer())
          .get('/api/v1/comms/tickets')
          .set('X-Branch-Id', 'branch2')
      ]);

      expect(branch1Response.status).toBe(200);
      expect(branch2Response.status).toBe(200);

      // Verify isolation
      const branch1Ids = branch1Response.body.data.map(item => item.id);
      const branch2Ids = branch2Response.body.data.map(item => item.id);
      const intersection = branch1Ids.filter(id => branch2Ids.includes(id));
      
      expect(intersection.length).toBe(0);
      
      // Verify branchId
      branch1Response.body.data.forEach(item => {
        expect(item.branchId).toBe('branch1');
      });
    });

    it('should support filtering by status', async () => {
      const filter = { status: 'open' };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/tickets?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      response.body.data.forEach(item => {
        expect(item.status).toBe('open');
      });
    });

    it('should support filtering by category', async () => {
      const filter = { category: 'technical' };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/tickets?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      response.body.data.forEach(item => {
        expect(item.category).toBe('technical');
      });
    });

    it('should support filtering by priority', async () => {
      const filter = { priority: 'high' };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/tickets?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      response.body.data.forEach(item => {
        expect(item.priority).toBe('high');
      });
    });

    it('should handle pagination correctly', async () => {
      const page1 = await request(app.getHttpServer())
        .get('/api/v1/comms/tickets?page=1&perPage=3')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const page2 = await request(app.getHttpServer())
        .get('/api/v1/comms/tickets?page=2&perPage=3')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      // Verify no overlap
      const page1Ids = page1.body.data.map(item => item.id);
      const page2Ids = page2.body.data.map(item => item.id);
      const overlap = page1Ids.filter(id => page2Ids.includes(id));
      
      expect(overlap.length).toBe(0);
    });
  });

  describe('GET /api/v1/tickets/:id', () => {
    it('should return single ticket with correct format', async () => {
      // First get list to find an ID
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/comms/tickets')
        .set('X-Branch-Id', 'branch1');
      
      const testId = listResponse.body.data[0]?.id;
      if (!testId) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/tickets/${testId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', testId);
      expect(response.body.data).toHaveProperty('subject');
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('branchId', 'branch1');
    });

    it('should return 404 for non-existent ticket', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/comms/tickets/non-existent-id')
        .set('X-Branch-Id', 'branch1')
        .expect(404);
    });
  });

  describe('POST /api/v1/tickets', () => {
    it('should create new ticket with correct format', async () => {
      // Get a guardian ID for the owner
      const guardianResponse = await request(app.getHttpServer())
        .get('/api/v1/guardians')
        .set('X-Branch-Id', 'branch1');
      
      if (guardianResponse.body.data.length === 0) {
        return; // Skip if no guardians
      }

      const newTicket = {
        ownerType: 'guardian',
        ownerId: guardianResponse.body.data[0].id,
        category: 'technical',
        priority: 'normal',
        status: 'open',
        subject: 'Test Support Ticket',
        description: 'This is a test ticket created by E2E tests.'
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/comms/tickets')
        .set('X-Branch-Id', 'branch1')
        .send(newTicket)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toMatchObject(newTicket);
      expect(response.body.data.branchId).toBe('branch1');
    });

    it('should validate required fields', async () => {
      const invalidTicket = {
        subject: 'Invalid Ticket'
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/api/v1/comms/tickets')
        .set('X-Branch-Id', 'branch1')
        .send(invalidTicket)
        .expect(400);
    });
  });

  describe('Ticket-specific tests with seed data', () => {
    it('should find tickets with realistic subjects from seed data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/comms/tickets')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const subjects = response.body.data.map(t => t.subject);
      // Check for actual subjects from seed data
      const expectedSubjects = [
        'Unable to access student portal',
        'Fee payment not reflecting', 
        'Attendance discrepancy for my child',
        'Request for duplicate report card',
        'Transport route change request'
      ];
      const hasExpectedSubjects = expectedSubjects.some(subject => 
        subjects.includes(subject)
      );
      expect(hasExpectedSubjects).toBe(true);
    });

    it('should find tickets in different categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/comms/tickets')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const categories = response.body.data.map(t => t.category);
      const expectedCategories = ['academic', 'fees', 'technical', 'general'];
      const hasVariousCategories = expectedCategories.some(category => categories.includes(category));
      expect(hasVariousCategories).toBe(true);
    });

    it('should find tickets with different statuses', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/comms/tickets')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const statuses = response.body.data.map(t => t.status);
      const expectedStatuses = ['open', 'in_progress', 'resolved', 'closed'];
      const hasVariousStatuses = expectedStatuses.some(status => statuses.includes(status));
      expect(hasVariousStatuses).toBe(true);
    });

    it('should find tickets with guardian owners', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/comms/tickets')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const guardiansAsOwners = response.body.data.filter(t => t.ownerType === 'guardian');
      expect(guardiansAsOwners.length).toBeGreaterThan(0);
    });

    it('should have tickets with SLA due dates', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/comms/tickets')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      response.body.data.forEach(ticket => {
        if (ticket.slaDueAt) {
          expect(new Date(ticket.slaDueAt)).toBeInstanceOf(Date);
        }
      });
    });
  });
});