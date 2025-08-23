import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

describe('Subjects API (e2e)', () => {
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

  describe('GET /api/v1/subjects', () => {
    it('should return paginated list with correct format', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/subjects?page=1&perPage=5')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(typeof response.body.total).toBe('number');

      if (response.body.data.length > 0) {
        const subject = response.body.data[0];
        expect(subject).toHaveProperty('id');
        expect(subject).toHaveProperty('code');
        expect(subject).toHaveProperty('name');
        expect(subject).toHaveProperty('credits');
        expect(subject).toHaveProperty('isElective');
        expect(subject).toHaveProperty('branchId', 'branch1');
        expect(typeof subject.credits).toBe('number');
        expect(typeof subject.isElective).toBe('boolean');
      }
    });

    it('should isolate data between tenants', async () => {
      const [branch1Response, branch2Response] = await Promise.all([
        request(app.getHttpServer())
          .get('/api/v1/subjects')
          .set('X-Branch-Id', 'branch1'),
        request(app.getHttpServer())
          .get('/api/v1/subjects')
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
        .get('/api/v1/subjects?sort=name')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const names = response.body.data.map(item => item.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    it('should support descending sorting by credits', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/subjects?sort=-credits')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const credits = response.body.data.map(item => item.credits);
      const sortedCredits = [...credits].sort((a, b) => b - a);
      expect(credits).toEqual(sortedCredits);
    });

    it('should support filtering by isElective', async () => {
      const filter = { isElective: false };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/subjects?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      response.body.data.forEach(item => {
        expect(item.isElective).toBe(false);
      });
    });

    it('should support filtering by credits', async () => {
      const filter = { credits: 4 };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/subjects?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      response.body.data.forEach(item => {
        expect(item.credits).toBe(4);
      });
    });

    it('should support filtering by subject code', async () => {
      const filter = { code: 'MATH' };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/subjects?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      response.body.data.forEach(item => {
        expect(item.code).toBe('MATH');
      });
    });

    it('should handle pagination correctly', async () => {
      const page1 = await request(app.getHttpServer())
        .get('/api/v1/subjects?page=1&perPage=3')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const page2 = await request(app.getHttpServer())
        .get('/api/v1/subjects?page=2&perPage=3')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      // Verify no overlap
      const page1Ids = page1.body.data.map(item => item.id);
      const page2Ids = page2.body.data.map(item => item.id);
      const overlap = page1Ids.filter(id => page2Ids.includes(id));
      
      expect(overlap.length).toBe(0);
    });
  });

  describe('GET /api/v1/subjects/:id', () => {
    it('should return single subject with correct format', async () => {
      // First get list to find an ID
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/subjects')
        .set('X-Branch-Id', 'branch1');
      
      const testId = listResponse.body.data[0]?.id;
      if (!testId) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/subjects/${testId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', testId);
      expect(response.body.data).toHaveProperty('code');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('branchId', 'branch1');
    });

    it('should return 404 for non-existent subject', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/subjects/non-existent-id')
        .set('X-Branch-Id', 'branch1')
        .expect(404);
    });

    it('should not return subject from different tenant', async () => {
      // Get item from branch1
      const branch1List = await request(app.getHttpServer())
        .get('/api/v1/subjects')
        .set('X-Branch-Id', 'branch1');
      
      const branch1Id = branch1List.body.data[0]?.id;
      if (!branch1Id) return;

      // Try to access from branch2
      await request(app.getHttpServer())
        .get(`/api/v1/subjects/${branch1Id}`)
        .set('X-Branch-Id', 'branch2')
        .expect(404);
    });
  });

  describe('POST /api/v1/subjects', () => {
    it('should create new subject with correct format', async () => {
      const timestamp = Date.now();
      const newSubject = {
        code: `TEST${timestamp}`,
        name: 'Test Subject',
        credits: 3,
        isElective: true
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/subjects')
        .set('X-Branch-Id', 'branch1')
        .send(newSubject)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toMatchObject(newSubject);
      expect(response.body.data.branchId).toBe('branch1');
    });

    it('should validate required fields', async () => {
      const invalidSubject = {
        code: `TEST2${Date.now()}`
        // Missing name, credits
      };

      await request(app.getHttpServer())
        .post('/api/v1/subjects')
        .set('X-Branch-Id', 'branch1')
        .send(invalidSubject)
        .expect(400);
    });

    it('should validate unique subject code per tenant', async () => {
      // Try to create with existing code
      const duplicateSubject = {
        code: 'MATH', // This exists in seed data
        name: 'Duplicate Mathematics',
        credits: 4,
        isElective: false
      };

      await request(app.getHttpServer())
        .post('/api/v1/subjects')
        .set('X-Branch-Id', 'branch1')
        .send(duplicateSubject)
        .expect(409);
    });
  });

  describe('PUT /api/v1/subjects/:id', () => {
    it('should update subject with correct format', async () => {
      // First create a subject to update
      const timestamp = Date.now();
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/subjects')
        .set('X-Branch-Id', 'branch1')
        .send({
          code: `UPD${timestamp}`,
          name: 'Original Subject',
          credits: 2,
          isElective: true
        });

      const subjectId = createResponse.body.data.id;

      const updateData = {
        code: `UPD${timestamp}`,
        name: 'Updated Subject',
        credits: 3,
        isElective: false
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/subjects/${subjectId}`)
        .set('X-Branch-Id', 'branch1')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toMatchObject(updateData);
      expect(response.body.data.id).toBe(subjectId);
    });

    it('should not update subject from different tenant', async () => {
      // Get item from branch1
      const branch1List = await request(app.getHttpServer())
        .get('/api/v1/subjects')
        .set('X-Branch-Id', 'branch1');
      
      const branch1Id = branch1List.body.data[0]?.id;
      if (!branch1Id) return;

      // Try to update from branch2
      await request(app.getHttpServer())
        .put(`/api/v1/subjects/${branch1Id}`)
        .set('X-Branch-Id', 'branch2')
        .send({ name: 'Hacked Subject' })
        .expect(404);
    });
  });

  describe('PATCH /api/v1/subjects/:id', () => {
    it('should partially update subject', async () => {
      // First get an existing subject
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/subjects')
        .set('X-Branch-Id', 'branch1');
      
      const subjectId = listResponse.body.data[0]?.id;
      if (!subjectId) return;

      const patchData = {
        credits: 5
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/subjects/${subjectId}`)
        .set('X-Branch-Id', 'branch1')
        .send(patchData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.credits).toBe(5);
      expect(response.body.data.id).toBe(subjectId);
    });
  });

  describe('DELETE /api/v1/subjects/:id', () => {
    it('should delete subject with correct format', async () => {
      // First create a subject to delete
      const timestamp = Date.now();
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/subjects')
        .set('X-Branch-Id', 'branch1')
        .send({
          code: `DEL${timestamp}`,
          name: 'Subject to Delete',
          credits: 2,
          isElective: true
        });

      const subjectId = createResponse.body.data.id;

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/subjects/${subjectId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.id).toBe(subjectId);

      // Verify it's deleted
      await request(app.getHttpServer())
        .get(`/api/v1/subjects/${subjectId}`)
        .set('X-Branch-Id', 'branch1')
        .expect(404);
    });
  });

  describe('GET /api/v1/subjects (getMany)', () => {
    it('should return multiple subjects by ids', async () => {
      // Get some IDs
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/subjects')
        .set('X-Branch-Id', 'branch1');
      
      const ids = listResponse.body.data
        .slice(0, 3)
        .map(item => item.id);

      if (ids.length === 0) return;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/subjects?ids=${ids.join(',')}`)
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

  describe('Subject-specific tests with seed data', () => {
    it('should find core subjects from seed data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/subjects')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const subjectCodes = response.body.data.map(s => s.code);
      const coreSubjects = ['MATH', 'SCI', 'ENG', 'HINDI'];
      const hasCoreSubjects = coreSubjects.every(code => subjectCodes.includes(code));
      expect(hasCoreSubjects).toBe(true);
    });

    it('should find subjects with correct names from seed data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/subjects')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const subjectNames = response.body.data.map(s => s.name);
      expect(subjectNames).toContain('Mathematics');
      expect(subjectNames).toContain('Science');
      expect(subjectNames).toContain('English');
      expect(subjectNames).toContain('Hindi');
    });

    it('should find mandatory subjects with correct credits', async () => {
      const filter = { isElective: false };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/subjects?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const mathSubject = response.body.data.find(s => s.code === 'MATH');
      if (mathSubject) {
        expect(mathSubject.credits).toBe(4);
        expect(mathSubject.isElective).toBe(false);
      }

      const scienceSubject = response.body.data.find(s => s.code === 'SCI');
      if (scienceSubject) {
        expect(scienceSubject.credits).toBe(4);
        expect(scienceSubject.isElective).toBe(false);
      }
    });

    it('should find elective subjects from seed data', async () => {
      const filter = { isElective: true };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/subjects?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const electiveCodes = response.body.data.map(s => s.code);
      expect(electiveCodes).toContain('ART'); // Art & Craft
      expect(electiveCodes).toContain('MUS'); // Music
      expect(electiveCodes).toContain('COMP'); // Computer Science
    });

    it('should find science subjects with high credits', async () => {
      const filter = { credits: 4 };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/subjects?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const highCreditSubjects = response.body.data.map(s => s.code);
      expect(highCreditSubjects).toContain('MATH');
      expect(highCreditSubjects).toContain('SCI');
      expect(highCreditSubjects).toContain('PHY'); // Physics
      expect(highCreditSubjects).toContain('CHEM'); // Chemistry
      expect(highCreditSubjects).toContain('BIO'); // Biology
    });

    it('should find senior secondary subjects from seed data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/subjects')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const subjectCodes = response.body.data.map(s => s.code);
      const seniorSubjects = ['PHY', 'CHEM', 'BIO', 'ECO'];
      const hasSeniorSubjects = seniorSubjects.every(code => subjectCodes.includes(code));
      expect(hasSeniorSubjects).toBe(true);
    });

    it('should find physical education as mandatory subject', async () => {
      const filter = { code: 'PE' };
      const response = await request(app.getHttpServer())
        .get(`/api/v1/subjects?filter=${encodeURIComponent(JSON.stringify(filter))}`)
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      if (response.body.data.length > 0) {
        const peSubject = response.body.data[0];
        expect(peSubject.name).toBe('Physical Education');
        expect(peSubject.credits).toBe(2);
        expect(peSubject.isElective).toBe(false);
      }
    });

    it('should have appropriate credit distribution', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/subjects')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const creditDistribution = {};
      response.body.data.forEach(subject => {
        const credits = subject.credits;
        creditDistribution[credits] = (creditDistribution[credits] || 0) + 1;
      });

      // Should have subjects with 2, 3, and 4 credits
      expect(creditDistribution[2]).toBeGreaterThan(0); // PE, Art
      expect(creditDistribution[3]).toBeGreaterThan(0); // Hindi, Social Studies
      expect(creditDistribution[4]).toBeGreaterThan(0); // Math, Science, Physics, Chemistry, Biology
    });

    it('should find geography and history subjects', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/subjects')
        .set('X-Branch-Id', 'branch1')
        .expect(200);

      const subjectCodes = response.body.data.map(s => s.code);
      expect(subjectCodes).toContain('HIST'); // History
      expect(subjectCodes).toContain('GEO'); // Geography

      const historySubject = response.body.data.find(s => s.code === 'HIST');
      if (historySubject) {
        expect(historySubject.name).toBe('History');
        expect(historySubject.credits).toBe(3);
      }
    });
  });
});