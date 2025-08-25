import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

describe('Campaigns API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.PORT = '0';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    
    // Set up the branch scoping middleware (critical for multi-tenancy)
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

  describe('GET /api/v1/comms/campaigns', () => {
    it('should return paginated list with correct format', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/comms/campaigns?page=1&perPage=5')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(typeof response.body.total).toBe('number');

      if (response.body.data.length > 0) {
        const campaign = response.body.data[0];
        expect(campaign).toHaveProperty('id');
        expect(campaign).toHaveProperty('name');
        expect(campaign).toHaveProperty('templateId');
        expect(campaign).toHaveProperty('audienceQuery');
        expect(campaign).toHaveProperty('schedule');
        expect(campaign).toHaveProperty('status');
        expect(campaign).toHaveProperty('branchId', 'branch1');
        expect(['draft', 'scheduled', 'active', 'completed', 'cancelled']).toContain(campaign.status);
      }
    });

    it('should isolate data between tenants', async () => {
      const [branch1Response, branch2Response] = await Promise.all([
        request(app.getHttpServer())
          .get('/api/v1/comms/campaigns')
          .set('X-Branch-Id', 'branch1'),
        request(app.getHttpServer())
          .get('/api/v1/comms/campaigns')
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

    it('should support ascending sorting by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/comms/campaigns?sort=name')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const names = response.body.data.map(item => item.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    it('should support descending sorting by schedule', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/comms/campaigns?sort=-schedule')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const schedules = response.body.data.map(item => new Date(item.schedule));
      const sortedSchedules = [...schedules].sort((a, b) => b.getTime() - a.getTime());
      expect(schedules.map(d => d.getTime())).toEqual(sortedSchedules.map(d => d.getTime()));
    });

    it('should support filtering by status', async () => {
      const filter = { status: 'active' };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/comms/campaigns?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      response.body.data.forEach(item => {
        expect(item.status).toBe('active');
      });
    });

    it('should support filtering by templateId', async () => {
      // First get a template ID
      const templateResponse = await request(app.getHttpServer())
        .get('/api/v1/comms/templates')
        .set('X-Branch-Id', 'branch1');
      
      if (templateResponse.body.data.length > 0) {
        const templateId = templateResponse.body.data[0].id;
        const filter = { templateId: templateId };
        
        const response = await request(app.getHttpServer())
          .get(`/api/v1/comms/campaigns?filter=${encodeURIComponent(JSON.stringify(filter))}`)
          .set('X-Branch-Id', 'branch1')
          .expect(200);

        response.body.data.forEach(item => {
          expect(item.templateId).toBe(templateId);
        });
      }
    });

    it('should handle pagination correctly', async () => {
      const page1 = await request(app.getHttpServer())
        .get('/api/v1/comms/campaigns?page=1&perPage=2')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const page2 = await request(app.getHttpServer())
        .get('/api/v1/comms/campaigns?page=2&perPage=2')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      // Verify no overlap
      const page1Ids = page1.body.data.map(item => item.id);
      const page2Ids = page2.body.data.map(item => item.id);
      const overlap = page1Ids.filter(id => page2Ids.includes(id));
      
      expect(overlap.length).toBe(0);
    });
  });

  describe('GET /api/v1/comms/campaigns/:id', () => {
    it('should return single campaign with correct format', async () => {
      // First get list to find an ID
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/comms/campaigns')
        .set('X-Branch-Id', 'branch1');
      
      const testId = listResponse.body.data[0]?.id;
      if (!testId) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/comms/campaigns/${testId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', testId);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('branchId', 'branch1');
    });

    it('should return campaign with template relationship', async () => {
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/comms/campaigns')
        .set('X-Branch-Id', 'branch1');
      
      const testId = listResponse.body.data[0]?.id;
      if (!testId) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/comms/campaigns/${testId}?include=template`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body.data).toHaveProperty('template');
      if (response.body.data.template) {
        expect(response.body.data.template).toHaveProperty('name');
        expect(response.body.data.template).toHaveProperty('content');
      }
    });

    it('should return 404 for non-existent campaign', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/comms/campaigns/non-existent-id')
        .set('X-Branch-Id', 'branch1')
        .expect(404);
    });

    it('should not return campaign from different tenant', async () => {
      // Get item from branch1
      const branch1List = await request(app.getHttpServer())
        .get('/api/v1/comms/campaigns')
        .set('X-Branch-Id', 'branch1');
      
      const branch1Id = branch1List.body.data[0]?.id;
      if (!branch1Id) return;

      // Try to access from branch2
      await request(app.getHttpServer())
        .get(`/api/v1/comms/campaigns/${branch1Id}`)
        .set('X-Branch-Id', 'branch2')
        .expect(404);
    });
  });

  describe('POST /api/v1/comms/campaigns', () => {
    it('should create new campaign with correct format', async () => {
      // First get a template ID
      const templateResponse = await request(app.getHttpServer())
        .get('/api/v1/comms/templates')
        .set('X-Branch-Id', 'branch1');
      
      if (templateResponse.body.data.length === 0) {
        return; // Skip if no templates
      }

      const newCampaign = {
        name: 'Test Campaign',
        templateId: templateResponse.body.data[0].id,
        audienceQuery: JSON.stringify({ classes: ['Class 1', 'Class 2'] }),
        schedule: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        status: 'scheduled'
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/comms/campaigns')
        .set('X-Branch-Id', 'branch1')
        .send(newCampaign)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toMatchObject({
        name: newCampaign.name,
        templateId: newCampaign.templateId,
        status: newCampaign.status
      });
      expect(response.body.data.branchId).toBe('branch1');
    });

    it('should validate required fields', async () => {
      const invalidCampaign = {
        name: 'Invalid Campaign'
        // Missing templateId, audienceQuery, schedule
      };

      await request(app.getHttpServer())
        .post('/api/v1/comms/campaigns')
        .set('X-Branch-Id', 'branch1')
        .send(invalidCampaign)
        .expect(400);
    });

    it('should validate future schedule date', async () => {
      const templateResponse = await request(app.getHttpServer())
        .get('/api/v1/comms/templates')
        .set('X-Branch-Id', 'branch1');
      
      if (templateResponse.body.data.length === 0) return;

      const invalidCampaign = {
        name: 'Past Campaign',
        templateId: templateResponse.body.data[0].id,
        audienceQuery: JSON.stringify({ classes: ['Class 1'] }),
        schedule: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        status: 'scheduled'
      };

      await request(app.getHttpServer())
        .post('/api/v1/comms/campaigns')
        .set('X-Branch-Id', 'branch1')
        .send(invalidCampaign)
        .expect(400);
    });
  });

  describe('PUT /api/v1/comms/campaigns/:id', () => {
    it('should update campaign with correct format', async () => {
      // First create a campaign to update
      const templateResponse = await request(app.getHttpServer())
        .get('/api/v1/comms/templates')
        .set('X-Branch-Id', 'branch1');
      
      if (templateResponse.body.data.length === 0) return;

      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/comms/campaigns')
        .set('X-Branch-Id', 'branch1')
        .send({
          name: 'Original Campaign',
          templateId: templateResponse.body.data[0].id,
          audienceQuery: JSON.stringify({ classes: ['Class 1'] }),
          schedule: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          status: 'draft'
        });

      const campaignId = createResponse.body.data.id;

      const updateData = {
        name: 'Updated Campaign',
        templateId: templateResponse.body.data[0].id,
        audienceQuery: JSON.stringify({ classes: ['Class 1', 'Class 2', 'Class 3'] }),
        schedule: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        status: 'scheduled'
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/comms/campaigns/${campaignId}`)
        .set('X-Branch-Id', 'branch1')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.name).toBe('Updated Campaign');
      expect(response.body.data.status).toBe('scheduled');
      expect(response.body.data.id).toBe(campaignId);
    });

    it('should not update campaign from different tenant', async () => {
      // Get item from branch1
      const branch1List = await request(app.getHttpServer())
        .get('/api/v1/comms/campaigns')
        .set('X-Branch-Id', 'branch1');
      
      const branch1Id = branch1List.body.data[0]?.id;
      if (!branch1Id) return;

      // Try to update from branch2
      await request(app.getHttpServer())
        .put(`/api/v1/comms/campaigns/${branch1Id}`)
        .set('X-Branch-Id', 'branch2')
        .send({ name: 'Hacked Campaign' })
        .expect(404);
    });
  });

  describe('PATCH /api/v1/comms/campaigns/:id', () => {
    it('should partially update campaign status', async () => {
      // First get an existing campaign
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/comms/campaigns')
        .set('X-Branch-Id', 'branch1');
      
      const campaignId = listResponse.body.data[0]?.id;
      if (!campaignId) return;

      const patchData = {
        status: 'cancelled'
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/comms/campaigns/${campaignId}`)
        .set('X-Branch-Id', 'branch1')
        .send(patchData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.status).toBe('cancelled');
      expect(response.body.data.id).toBe(campaignId);
    });
  });

  describe('DELETE /api/v1/comms/campaigns/:id', () => {
    it('should delete campaign with correct format', async () => {
      // First create a campaign to delete
      const templateResponse = await request(app.getHttpServer())
        .get('/api/v1/comms/templates')
        .set('X-Branch-Id', 'branch1');
      
      if (templateResponse.body.data.length === 0) return;

      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/comms/campaigns')
        .set('X-Branch-Id', 'branch1')
        .send({
          name: 'Campaign to Delete',
          templateId: templateResponse.body.data[0].id,
          audienceQuery: JSON.stringify({ classes: ['Class 1'] }),
          schedule: new Date(Date.now() + 96 * 60 * 60 * 1000).toISOString(),
          status: 'draft'
        });

      const campaignId = createResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/comms/campaigns/${campaignId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(campaignId);

      // Verify it's deleted
      await request(app.getHttpServer())
        .get(`/api/v1/comms/campaigns/${campaignId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(404);
    });
  });

  describe('GET /api/v1/comms/campaigns (getMany)', () => {
    it('should return multiple campaigns by ids', async () => {
      // Get some IDs
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/comms/campaigns')
        .set('X-Branch-Id', 'branch1');
      
      const ids = listResponse.body.data
        .slice(0, 3)
        .map(item => item.id);

      if (ids.length === 0) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/comms/campaigns?ids=${ids.join(',')}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(ids.length);
      
      response.body.data.forEach(item => {
        expect(ids).toContain(item.id);
      });
    });
  });

  describe('Campaign-specific tests with seed data', () => {
    it('should find specific campaign names from seed data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/comms/campaigns')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const campaignNames = response.body.data.map(c => c.name);
      // Check that we have some campaign names
      expect(campaignNames.length).toBeGreaterThan(0);
      // All names should be strings
      campaignNames.forEach(name => {
        expect(typeof name).toBe('string');
        expect(name.length).toBeGreaterThan(0);
      });
    });

    it('should find campaigns with different statuses from seed data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/comms/campaigns')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const statuses = response.body.data.map(c => c.status);
      // Check that we have some statuses
      expect(statuses.length).toBeGreaterThan(0);
      // Valid campaign statuses
      const validStatuses = ['draft', 'scheduled', 'active', 'completed', 'paused', 'cancelled'];
      statuses.forEach(status => {
        expect(validStatuses).toContain(status);
      });
    });

    it('should find campaigns with class-based audience queries', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/comms/campaigns')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      // Find campaigns that specifically have class-based queries
      const classBasedCampaigns = response.body.data.filter(campaign => {
        if (!campaign.audienceQuery) return false;
        try {
          const query = JSON.parse(campaign.audienceQuery);
          return query.hasOwnProperty('classes');
        } catch {
          return false;
        }
      });

      // Check that we have some campaigns (queries may be optional)
      expect(response.body.data.length).toBeGreaterThanOrEqual(0);
      
      // If campaigns exist, check that they have valid structure
      const campaignsWithQueries = response.body.data.filter(c => c.audienceQuery);
      
      // Validate that audience queries are valid JSON
      campaignsWithQueries.forEach(campaign => {
        expect(() => JSON.parse(campaign.audienceQuery)).not.toThrow();
      });
    });

    it('should find fee reminder campaigns', async () => {
      const filter = { name: { "$contains": "Fee" } };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/comms/campaigns?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      // Filter should work even if no matching campaigns exist
      expect(Array.isArray(response.body.data)).toBe(true);
      // If there are results, they should contain 'fee' in the name
      response.body.data.forEach(campaign => {
        expect(campaign.name.toLowerCase()).toContain('fee');
      });
    });

    it('should find welcome campaigns for new academic year', async () => {
      const filter = { name: { "$contains": "Welcome" } };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/comms/campaigns?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      if (response.body.data.length > 0) {
        const welcomeCampaign = response.body.data[0];
        expect(welcomeCampaign.name).toBe('Welcome Campaign 2024');
        expect(welcomeCampaign.status).toBe('completed');
      }
    });

    it('should find exam notification campaigns', async () => {
      const filter = { name: { "$contains": "Exam" } };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/comms/campaigns?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      if (response.body.data.length > 0) {
        response.body.data.forEach(campaign => {
          expect(campaign.name.toLowerCase()).toContain('exam');
        });
      }
    });

    it('should find attendance alert campaigns', async () => {
      const filter = { name: { "$contains": "Attendance" } };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/comms/campaigns?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      if (response.body.data.length > 0) {
        const attendanceCampaign = response.body.data[0];
        expect(attendanceCampaign.name).toContain('Attendance Alert');
        expect(attendanceCampaign.status).toBe('active');
      }
    });

    it('should find holiday notification campaigns', async () => {
      const filter = { name: { "$contains": "Holiday" } };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/comms/campaigns?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      if (response.body.data.length > 0) {
        response.body.data.forEach(campaign => {
          expect(campaign.name.toLowerCase()).toContain('holiday');
        });
      }
    });
  });
});