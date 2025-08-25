import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Grade Validation Demo (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Test data IDs
  let nurseryClassId: string;
  let class9Id: string;
  let mathSubjectId: string;
  let physicsSubjectId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Clean up any existing test data
    await cleanupTestData();

    // Set up minimal test data
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  async function setupTestData() {
    // Create Nursery class (grade 0)
    const nurseryClass = await prisma.class.create({
      data: {
        branchId: 'test-branch',
        name: 'Nursery',
        gradeLevel: 0,
      },
    });
    nurseryClassId = nurseryClass.id;

    // Create Class 9 (grade 11)
    const class9 = await prisma.class.create({
      data: {
        branchId: 'test-branch',
        name: 'Class 9',
        gradeLevel: 11,
      },
    });
    class9Id = class9.id;

    // Create Mathematics subject (appropriate for all grades)
    const mathSubject = await prisma.subject.create({
      data: {
        branchId: 'test-branch',
        code: 'TEST_MATH',
        name: 'Mathematics',
        credits: 4,
        isElective: false,
      },
    });
    mathSubjectId = mathSubject.id;

    // Create Physics subject (appropriate only for grade 9+)
    const physicsSubject = await prisma.subject.create({
      data: {
        branchId: 'test-branch',
        code: 'TEST_PHY',
        name: 'Physics',
        credits: 4,
        isElective: false,
      },
    });
    physicsSubjectId = physicsSubject.id;
  }

  async function cleanupTestData() {
    await prisma.subject.deleteMany({
      where: { branchId: 'test-branch' },
    });
    await prisma.class.deleteMany({
      where: { branchId: 'test-branch' },
    });
  }

  describe('Subject-Grade Appropriateness Validation', () => {
    it('should validate appropriate assignment (Math for Nursery)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/subjects/validate-assignment/${mathSubjectId}/${nurseryClassId}`)
        .set('x-branch-id', 'test-branch')
        .expect(200);

      expect(response.body).toHaveProperty('isValid', true);
    });

    it('should reject inappropriate assignment (Physics for Nursery)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/subjects/validate-assignment/${physicsSubjectId}/${nurseryClassId}`)
        .set('x-branch-id', 'test-branch')
        .expect(200);

      expect(response.body).toHaveProperty('isValid', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not appropriate for Nursery');
      expect(response.body).toHaveProperty('suggestion');
    });

    it('should validate appropriate assignment (Physics for Class 9)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/subjects/validate-assignment/${physicsSubjectId}/${class9Id}`)
        .set('x-branch-id', 'test-branch')
        .expect(200);

      expect(response.body).toHaveProperty('isValid', true);
    });

    it('should return appropriate subjects for Nursery class', async () => {
      const response = await request(app.getHttpServer())
        .get(`/subjects/appropriate-for-class/${nurseryClassId}`)
        .set('x-branch-id', 'test-branch')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('gradeLevel', 0);
      expect(response.body).toHaveProperty('className', 'Nursery');

      const subjectNames = response.body.data.map(s => s.name);
      expect(subjectNames).toContain('Mathematics');
      expect(subjectNames).not.toContain('Physics');
    });

    it('should return both subjects for Class 9', async () => {
      const response = await request(app.getHttpServer())
        .get(`/subjects/appropriate-for-class/${class9Id}`)
        .set('x-branch-id', 'test-branch')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('gradeLevel', 11);
      expect(response.body).toHaveProperty('className', 'Class 9');

      const subjectNames = response.body.data.map(s => s.name);
      expect(subjectNames).toContain('Mathematics');
      expect(subjectNames).toContain('Physics');
    });
  });

  describe('Grade-filtered subject listing', () => {
    it('should filter subjects by grade level 0 (Nursery)', async () => {
      const response = await request(app.getHttpServer())
        .get('/subjects/with-grade-filter')
        .query({ gradeLevel: '0' })
        .set('x-branch-id', 'test-branch')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('gradeLevel', 0);
      expect(response.body).toHaveProperty('filteredByGrade', true);

      const subjectNames = response.body.data.map(s => s.name);
      expect(subjectNames).toContain('Mathematics');
      expect(subjectNames).not.toContain('Physics');
    });

    it('should include Physics for grade 11 (Class 9)', async () => {
      const response = await request(app.getHttpServer())
        .get('/subjects/with-grade-filter')
        .query({ gradeLevel: '11' })
        .set('x-branch-id', 'test-branch')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('gradeLevel', 11);
      expect(response.body).toHaveProperty('filteredByGrade', true);

      const subjectNames = response.body.data.map(s => s.name);
      expect(subjectNames).toContain('Mathematics');
      expect(subjectNames).toContain('Physics');
    });

    it('should filter by class name', async () => {
      const response = await request(app.getHttpServer())
        .get('/subjects/with-grade-filter')
        .query({ className: 'Nursery' })
        .set('x-branch-id', 'test-branch')
        .expect(200);

      expect(response.body).toHaveProperty('gradeLevel', 0);
      const subjectNames = response.body.data.map(s => s.name);
      expect(subjectNames).not.toContain('Physics');
    });
  });
});