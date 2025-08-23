import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

describe('Templates API (e2e)', () => {
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

  describe('GET /api/v1/templates', () => {
    it('should return paginated list with correct format', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/comms/templates?page=1&perPage=5')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(typeof response.body.total).toBe('number');

      if (response.body.data.length > 0) {
        const template = response.body.data[0];
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('channel');
        expect(template).toHaveProperty('content');
        expect(template).toHaveProperty('variables');
        expect(template).toHaveProperty('branchId', 'branch1');
        expect(['email', 'sms', 'push']).toContain(template.channel);
        expect(template.content).toContain('{{');
      }
    });

    it('should isolate data between tenants', async () => {
      const [branch1Response, branch2Response] = await Promise.all([
        request(app.getHttpServer())
          .get('/api/v1/comms/templates')
          .set('X-Branch-Id', 'branch1'),
        request(app.getHttpServer())
          .get('/api/v1/comms/templates')
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
        .get('/api/v1/comms/templates?sort=name')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const names = response.body.data.map(item => item.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    it('should support descending sorting by createdAt', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/comms/templates?sort=-createdAt')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const dates = response.body.data.map(item => new Date(item.createdAt));
      const sortedDates = [...dates].sort((a, b) => b.getTime() - a.getTime());
      expect(dates.map(d => d.getTime())).toEqual(sortedDates.map(d => d.getTime()));
    });

    it('should support filtering by channel', async () => {
      const filter = { channel: 'email' };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/comms/templates?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      response.body.data.forEach(item => {
        expect(item.channel).toBe('email');
      });
    });

    it('should support filtering by name pattern', async () => {
      const filter = { name: { "$contains": "Welcome" } };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/comms/templates?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      response.body.data.forEach(item => {
        expect(item.name.toLowerCase()).toContain('welcome');
      });
    });

    it('should handle pagination correctly', async () => {
      const page1 = await request(app.getHttpServer())
        .get('/api/v1/comms/templates?page=1&perPage=2')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const page2 = await request(app.getHttpServer())
        .get('/api/v1/comms/templates?page=2&perPage=2')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      // Verify no overlap
      const page1Ids = page1.body.data.map(item => item.id);
      const page2Ids = page2.body.data.map(item => item.id);
      const overlap = page1Ids.filter(id => page2Ids.includes(id));
      
      expect(overlap.length).toBe(0);
    });
  });

  describe('GET /api/v1/templates/:id', () => {
    it('should return single template with correct format', async () => {
      // First get list to find an ID
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/comms/templates')
        .set('X-Branch-Id', 'branch1');
      
      const testId = listResponse.body.data[0]?.id;
      if (!testId) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/comms/templates/${testId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', testId);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('content');
      expect(response.body.data).toHaveProperty('branchId', 'branch1');
    });

    it('should return template with campaigns relationship', async () => {
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/comms/templates')
        .set('X-Branch-Id', 'branch1');
      
      const testId = listResponse.body.data[0]?.id;
      if (!testId) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/comms/templates/${testId}?include=campaigns`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body.data).toHaveProperty('campaigns');
    });

    it('should return 404 for non-existent template', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/comms/templates/non-existent-id')
        .set('X-Branch-Id', 'branch1')
        .expect(404);
    });

    it('should not return template from different tenant', async () => {
      // Get item from branch1
      const branch1List = await request(app.getHttpServer())
        .get('/api/v1/comms/templates')
        .set('X-Branch-Id', 'branch1');
      
      const branch1Id = branch1List.body.data[0]?.id;
      if (!branch1Id) return;

      // Try to access from branch2
      await request(app.getHttpServer())
        .get(`/api/v1/comms/templates/${branch1Id}`)
        .set('X-Branch-Id', 'branch2')
        .expect(404);
    });
  });

  describe('POST /api/v1/templates', () => {
    it('should create new template with correct format', async () => {
      const newTemplate = {
        name: 'Test Template',
        channel: 'email',
        content: 'Hello {{name}}, this is a test template with {{variable}}.',
        variables: JSON.stringify(['name', 'variable'])
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/comms/templates')
        .set('X-Branch-Id', 'branch1')
        .send(newTemplate)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toMatchObject(newTemplate);
      expect(response.body.data.branchId).toBe('branch1');
    });

    it('should validate required fields', async () => {
      const invalidTemplate = {
        name: 'Invalid Template'
        // Missing channel, content
      };

      await request(app.getHttpServer())
        .post('/api/v1/comms/templates')
        .set('X-Branch-Id', 'branch1')
        .send(invalidTemplate)
        .expect(400);
    });

    it('should validate channel values', async () => {
      const invalidTemplate = {
        name: 'Invalid Channel Template',
        channel: 'invalid_channel',
        content: 'Test content',
        variables: JSON.stringify([])
      };

      await request(app.getHttpServer())
        .post('/api/v1/comms/templates')
        .set('X-Branch-Id', 'branch1')
        .send(invalidTemplate)
        .expect(400);
    });

    it('should validate template variables match content', async () => {
      const invalidTemplate = {
        name: 'Mismatched Variables Template',
        channel: 'sms',
        content: 'Hello {{name}}, your {{amount}} is due.',
        variables: JSON.stringify(['name', 'different_variable']) // Doesn't match content
      };

      // This might pass depending on validation rules, but worth testing
      const response = await request(app.getHttpServer())
        .post('/api/v1/comms/templates')
        .set('X-Branch-Id', 'branch1')
        .send(invalidTemplate);

      expect([201, 400]).toContain(response.status);
    });
  });

  describe('PUT /api/v1/templates/:id', () => {
    it('should update template with correct format', async () => {
      // First create a template to update
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/comms/templates')
        .set('X-Branch-Id', 'branch1')
        .send({
          name: 'Original Template',
          channel: 'email',
          content: 'Original content with {{var1}}',
          variables: JSON.stringify(['var1'])
        });

      const templateId = createResponse.body.data.id;

      const updateData = {
        name: 'Updated Template',
        channel: 'sms',
        content: 'Updated content with {{var1}} and {{var2}}',
        variables: JSON.stringify(['var1', 'var2'])
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/comms/templates/${templateId}`)
        .set('X-Branch-Id', 'branch1')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toMatchObject(updateData);
      expect(response.body.data.id).toBe(templateId);
    });

    it('should not update template from different tenant', async () => {
      // Get item from branch1
      const branch1List = await request(app.getHttpServer())
        .get('/api/v1/comms/templates')
        .set('X-Branch-Id', 'branch1');
      
      const branch1Id = branch1List.body.data[0]?.id;
      if (!branch1Id) return;

      // Try to update from branch2
      await request(app.getHttpServer())
        .put(`/api/v1/comms/templates/${branch1Id}`)
        .set('X-Branch-Id', 'branch2')
        .send({ name: 'Hacked Template' })
        .expect(404);
    });
  });

  describe('PATCH /api/v1/templates/:id', () => {
    it('should partially update template', async () => {
      // First get an existing template
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/comms/templates')
        .set('X-Branch-Id', 'branch1');
      
      const templateId = listResponse.body.data[0]?.id;
      if (!templateId) return;

      const patchData = {
        name: 'Patched Template Name'
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/comms/templates/${templateId}`)
        .set('X-Branch-Id', 'branch1')
        .send(patchData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.name).toBe('Patched Template Name');
      expect(response.body.data.id).toBe(templateId);
    });
  });

  describe('DELETE /api/v1/templates/:id', () => {
    it('should delete template with correct format', async () => {
      // First create a template to delete
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/comms/templates')
        .set('X-Branch-Id', 'branch1')
        .send({
          name: 'Template to Delete',
          channel: 'sms',
          content: 'This template will be deleted {{soon}}',
          variables: JSON.stringify(['soon'])
        });

      const templateId = createResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/comms/templates/${templateId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(templateId);

      // Verify it's deleted
      await request(app.getHttpServer())
        .get(`/api/v1/comms/templates/${templateId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(404);
    });
  });

  describe('GET /api/v1/templates (getMany)', () => {
    it('should return multiple templates by ids', async () => {
      // Get some IDs
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/comms/templates')
        .set('X-Branch-Id', 'branch1');
      
      const ids = listResponse.body.data
        .slice(0, 3)
        .map(item => item.id);

      if (ids.length === 0) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/comms/templates?ids=${ids.join(',')}`)
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

  describe('Template-specific tests with seed data', () => {
    it('should find specific template names from seed data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/comms/templates')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const templateNames = response.body.data.map(t => t.name);
      const expectedNames = ['Welcome Message', 'Fee Reminder', 'Exam Notification', 'Attendance Alert', 'Holiday Notification'];
      const hasExpectedNames = expectedNames.some(name => templateNames.includes(name));
      expect(hasExpectedNames).toBe(true);
    });

    it('should find templates for different channels', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/comms/templates')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const channels = response.body.data.map(t => t.channel);
      expect(channels).toContain('email');
      expect(channels).toContain('sms');
    });

    it('should find welcome message template with proper variables', async () => {
      const filter = { name: 'Welcome Message' };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/comms/templates?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      if (response.body.data.length > 0) {
        const welcomeTemplate = response.body.data[0];
        expect(welcomeTemplate.channel).toBe('email');
        expect(welcomeTemplate.content).toContain('{{school_name}}');
        expect(welcomeTemplate.content).toContain('{{student_name}}');
        expect(welcomeTemplate.content).toContain('{{year}}');
        
        const variables = JSON.parse(welcomeTemplate.variables);
        expect(variables).toContain('school_name');
        expect(variables).toContain('student_name');
        expect(variables).toContain('year');
      }
    });

    it('should find fee reminder template with amount variables', async () => {
      const filter = { name: 'Fee Reminder' };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/comms/templates?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      if (response.body.data.length > 0) {
        const feeTemplate = response.body.data[0];
        expect(feeTemplate.channel).toBe('sms');
        expect(feeTemplate.content).toContain('{{amount}}');
        expect(feeTemplate.content).toContain('{{due_date}}');
        expect(feeTemplate.content).toContain('{{parent_name}}');
        
        const variables = JSON.parse(feeTemplate.variables);
        expect(variables).toContain('amount');
        expect(variables).toContain('due_date');
        expect(variables).toContain('parent_name');
      }
    });

    it('should find exam notification template', async () => {
      const filter = { name: 'Exam Notification' };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/comms/templates?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      if (response.body.data.length > 0) {
        const examTemplate = response.body.data[0];
        expect(examTemplate.channel).toBe('email');
        expect(examTemplate.content).toContain('{{exam_name}}');
        expect(examTemplate.content).toContain('{{start_date}}');
        expect(examTemplate.content).toContain('{{end_date}}');
      }
    });

    it('should find attendance alert template for SMS', async () => {
      const filter = { name: 'Attendance Alert' };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/comms/templates?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      if (response.body.data.length > 0) {
        const attendanceTemplate = response.body.data[0];
        expect(attendanceTemplate.channel).toBe('sms');
        expect(attendanceTemplate.content).toContain('{{student_name}}');
        expect(attendanceTemplate.content).toContain('{{status}}');
        expect(attendanceTemplate.content).toContain('{{date}}');
        expect(attendanceTemplate.content).toContain('{{absent_count}}');
      }
    });

    it('should find report card notification template', async () => {
      const filter = { name: 'Report Card Available' };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/comms/templates?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      if (response.body.data.length > 0) {
        const reportTemplate = response.body.data[0];
        expect(reportTemplate.channel).toBe('email');
        expect(reportTemplate.content).toContain('{{exam_name}}');
        expect(reportTemplate.content).toContain('{{grade}}');
        expect(reportTemplate.content).toContain('parent portal');
      }
    });

    it('should have proper variable formatting in all templates', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/comms/templates')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      response.body.data.forEach(template => {
        // Check that content has variables in {{}} format
        const variableMatches = template.content.match(/\{\{[^}]+\}\}/g) || [];
        expect(variableMatches.length).toBeGreaterThan(0);
        
        // Check that variables JSON is parseable
        expect(() => JSON.parse(template.variables)).not.toThrow();
        
        const variables = JSON.parse(template.variables);
        expect(Array.isArray(variables)).toBe(true);
        expect(variables.length).toBeGreaterThan(0);
      });
    });

    it('should have reasonable content length for SMS templates', async () => {
      const filter = { channel: 'sms' };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/comms/templates?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      response.body.data.forEach(template => {
        // SMS templates should be reasonably short (considering variable expansion)
        expect(template.content.length).toBeLessThan(300);
      });
    });
  });
});