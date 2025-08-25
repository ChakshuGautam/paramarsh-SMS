import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Grade-Appropriate Subject Filtering (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Test data IDs - will be populated during test setup
  let nurseryClassId: string;
  let class5Id: string;
  let class9Id: string;
  let nurseryAId: string;
  let class5AId: string;
  let class9AId: string;
  let mathSubjectId: string;
  let physicsSubjectId: string;
  let geographySubjectId: string;
  let artSubjectId: string;
  let academicYearId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Clean up any existing test data
    await cleanupTestData();

    // Set up test data
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  async function setupTestData() {
    // Create academic year
    const academicYear = await prisma.academicYear.create({
      data: {
        branchId: 'branch1',
        name: '2024-25',
        startDate: '2024-04-01',
        endDate: '2025-03-31',
        isActive: true,
      },
    });
    academicYearId = academicYear.id;

    // Create classes with different grade levels
    const nurseryClass = await prisma.class.create({
      data: {
        branchId: 'branch1',
        name: 'Nursery',
        gradeLevel: 0,
      },
    });
    nurseryClassId = nurseryClass.id;

    const class5 = await prisma.class.create({
      data: {
        branchId: 'branch1',
        name: 'Class 5',
        gradeLevel: 7, // Using the mapping from grade-subject-mapping.ts
      },
    });
    class5Id = class5.id;

    const class9 = await prisma.class.create({
      data: {
        branchId: 'branch1',
        name: 'Class 9',
        gradeLevel: 11, // Using the mapping from grade-subject-mapping.ts
      },
    });
    class9Id = class9.id;

    // Create sections
    const nurseryA = await prisma.section.create({
      data: {
        branchId: 'branch1',
        name: 'A',
        classId: nurseryClassId,
        capacity: 30,
      },
    });
    nurseryAId = nurseryA.id;

    const class5A = await prisma.section.create({
      data: {
        branchId: 'branch1',
        name: 'A',
        classId: class5Id,
        capacity: 35,
      },
    });
    class5AId = class5A.id;

    const class9A = await prisma.section.create({
      data: {
        branchId: 'branch1',
        name: 'A',
        classId: class9Id,
        capacity: 40,
      },
    });
    class9AId = class9A.id;

    // Create subjects
    const mathSubject = await prisma.subject.create({
      data: {
        branchId: 'branch1',
        code: 'MATH',
        name: 'Mathematics',
        credits: 4,
        isElective: false,
      },
    });
    mathSubjectId = mathSubject.id;

    const physicsSubject = await prisma.subject.create({
      data: {
        branchId: 'branch1',
        code: 'PHY',
        name: 'Physics',
        credits: 4,
        isElective: false,
      },
    });
    physicsSubjectId = physicsSubject.id;

    const geographySubject = await prisma.subject.create({
      data: {
        branchId: 'branch1',
        code: 'GEO',
        name: 'Geography',
        credits: 3,
        isElective: false,
      },
    });
    geographySubjectId = geographySubject.id;

    const artSubject = await prisma.subject.create({
      data: {
        branchId: 'branch1',
        code: 'ART',
        name: 'Art & Craft',
        credits: 2,
        isElective: true,
      },
    });
    artSubjectId = artSubject.id;
  }

  async function cleanupTestData() {
    // Delete in reverse order of creation to handle foreign key constraints
    await prisma.timetablePeriod.deleteMany({
      where: { branchId: 'branch1' },
    });
    await prisma.subject.deleteMany({
      where: { branchId: 'branch1' },
    });
    await prisma.section.deleteMany({
      where: { branchId: 'branch1' },
    });
    await prisma.class.deleteMany({
      where: { branchId: 'branch1' },
    });
    await prisma.academicYear.deleteMany({
      where: { branchId: 'branch1' },
    });
  }

  describe('GET /subjects/appropriate-for-class/:classId', () => {
    it('should return only age-appropriate subjects for Nursery (grade 0)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/subjects/appropriate-for-class/${nurseryClassId}`)
        .set('x-branch-id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('gradeLevel', 0);
      expect(response.body).toHaveProperty('className', 'Nursery');

      // Check that appropriate subjects are included
      const subjectNames = response.body.data.map(s => s.name);
      expect(subjectNames).toContain('Mathematics');
      expect(subjectNames).toContain('Art & Craft');

      // Check that inappropriate subjects are excluded
      expect(subjectNames).not.toContain('Physics');
      expect(subjectNames).not.toContain('Geography');
    });

    it('should return appropriate subjects for Class 5 (grade 7)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/subjects/appropriate-for-class/${class5Id}`)
        .set('x-branch-id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('gradeLevel', 7);
      expect(response.body).toHaveProperty('className', 'Class 5');

      const subjectNames = response.body.data.map(s => s.name);
      expect(subjectNames).toContain('Mathematics');
      expect(subjectNames).toContain('Art & Craft');

      // Geography is appropriate from grade 6+
      expect(subjectNames).toContain('Geography');

      // Physics is only appropriate from grade 9+
      expect(subjectNames).not.toContain('Physics');
    });

    it('should return all subjects for Class 9 (grade 11)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/subjects/appropriate-for-class/${class9Id}`)
        .set('x-branch-id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('gradeLevel', 11);
      expect(response.body).toHaveProperty('className', 'Class 9');

      const subjectNames = response.body.data.map(s => s.name);
      expect(subjectNames).toContain('Mathematics');
      expect(subjectNames).toContain('Art & Craft');
      expect(subjectNames).toContain('Geography');
      expect(subjectNames).toContain('Physics');
    });

    it('should return 404 for non-existent class', async () => {
      await request(app.getHttpServer())
        .get('/subjects/appropriate-for-class/non-existent-id')
        .set('x-branch-id', 'branch1')
        .expect(400); // BadRequestException for class not found
    });
  });

  describe('GET /subjects/with-grade-filter', () => {
    it('should filter subjects by grade level 0 (Nursery)', async () => {
      const response = await request(app.getHttpServer())
        .get('/subjects/with-grade-filter')
        .query({ gradeLevel: '0' })
        .set('x-branch-id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('gradeLevel', 0);
      expect(response.body).toHaveProperty('filteredByGrade', true);

      const subjectNames = response.body.data.map(s => s.name);
      expect(subjectNames).toContain('Mathematics');
      expect(subjectNames).toContain('Art & Craft');
      expect(subjectNames).not.toContain('Physics');
      expect(subjectNames).not.toContain('Geography');
    });

    it('should filter subjects by class name', async () => {
      const response = await request(app.getHttpServer())
        .get('/subjects/with-grade-filter')
        .query({ className: 'Class 9' })
        .set('x-branch-id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('gradeLevel', 11);
      expect(response.body).toHaveProperty('filteredByGrade', true);

      const subjectNames = response.body.data.map(s => s.name);
      expect(subjectNames).toContain('Physics'); // Physics is appropriate for Class 9
    });

    it('should filter subjects by class ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/subjects/with-grade-filter')
        .query({ classId: nurseryClassId })
        .set('x-branch-id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('gradeLevel', 0);
      expect(response.body).toHaveProperty('filteredByGrade', true);

      const subjectNames = response.body.data.map(s => s.name);
      expect(subjectNames).not.toContain('Physics');
      expect(subjectNames).not.toContain('Geography');
    });

    it('should return all subjects when no grade filter is provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/subjects/with-grade-filter')
        .set('x-branch-id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('filteredByGrade', false);

      const subjectNames = response.body.data.map(s => s.name);
      expect(subjectNames).toContain('Mathematics');
      expect(subjectNames).toContain('Physics');
      expect(subjectNames).toContain('Geography');
      expect(subjectNames).toContain('Art & Craft');
    });
  });

  describe('GET /subjects/validate-assignment/:subjectId/:classId', () => {
    it('should validate appropriate assignment (Math for Nursery)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/subjects/validate-assignment/${mathSubjectId}/${nurseryClassId}`)
        .set('x-branch-id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('isValid', true);
    });

    it('should reject inappropriate assignment (Physics for Nursery)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/subjects/validate-assignment/${physicsSubjectId}/${nurseryClassId}`)
        .set('x-branch-id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('isValid', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not appropriate for Nursery');
      expect(response.body).toHaveProperty('suggestion');
    });

    it('should validate appropriate assignment (Geography for Class 5)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/subjects/validate-assignment/${geographySubjectId}/${class5Id}`)
        .set('x-branch-id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('isValid', true);
    });

    it('should reject inappropriate assignment (Geography for Nursery)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/subjects/validate-assignment/${geographySubjectId}/${nurseryClassId}`)
        .set('x-branch-id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('isValid', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not appropriate for Nursery');
    });

    it('should validate appropriate assignment (Physics for Class 9)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/subjects/validate-assignment/${physicsSubjectId}/${class9Id}`)
        .set('x-branch-id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('isValid', true);
    });
  });

  describe('GET /subjects/inappropriate-assignments', () => {
    beforeEach(async () => {
      // Create some timetable periods with inappropriate assignments for testing
      await prisma.timetablePeriod.create({
        data: {
          branchId: 'branch1',
          sectionId: nurseryAId,
          subjectId: physicsSubjectId, // Inappropriate: Physics for Nursery
          dayOfWeek: 1,
          periodNumber: 1,
          startTime: '09:00',
          endTime: '09:45',
          academicYearId,
        },
      });

      await prisma.timetablePeriod.create({
        data: {
          branchId: 'branch1',
          sectionId: nurseryAId,
          subjectId: geographySubjectId, // Inappropriate: Geography for Nursery
          dayOfWeek: 1,
          periodNumber: 2,
          startTime: '09:45',
          endTime: '10:30',
          academicYearId,
        },
      });

      await prisma.timetablePeriod.create({
        data: {
          branchId: 'branch1',
          sectionId: class9AId,
          subjectId: mathSubjectId, // Appropriate: Math for Class 9
          dayOfWeek: 1,
          periodNumber: 1,
          startTime: '09:00',
          endTime: '09:45',
          academicYearId,
        },
      });
    });

    afterEach(async () => {
      // Clean up test periods
      await prisma.timetablePeriod.deleteMany({
        where: { branchId: 'branch1' },
      });
    });

    it('should return list of inappropriate assignments', async () => {
      const response = await request(app.getHttpServer())
        .get('/subjects/inappropriate-assignments')
        .set('x-branch-id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('summary');

      const { data, total, summary } = response.body;
      
      // Should find 2 inappropriate assignments
      expect(total).toBe(2);
      expect(data).toHaveLength(2);
      
      // Check summary
      expect(summary.totalPeriods).toBe(3);
      expect(summary.inappropriatePeriods).toBe(2);
      expect(summary.appropriatePeriods).toBe(1);
      expect(summary.percentageInappropriate).toBeGreaterThan(0);

      // Check specific inappropriate assignments
      const subjectNames = data.map(item => item.subjectName);
      expect(subjectNames).toContain('Physics');
      expect(subjectNames).toContain('Geography');

      // All inappropriate assignments should be for Nursery
      const classNames = data.map(item => item.className);
      expect(classNames.every(name => name === 'Nursery')).toBe(true);

      // Check that validation messages are present
      data.forEach(item => {
        expect(item.validation).toHaveProperty('isValid', false);
        expect(item.validation).toHaveProperty('message');
        expect(item.validation.message).toContain('not appropriate for Nursery');
      });
    });
  });

  describe('GET /subjects/subject-teacher-class-mapping', () => {
    beforeEach(async () => {
      // Create some timetable periods with mixed appropriate/inappropriate assignments
      await prisma.timetablePeriod.create({
        data: {
          branchId: 'branch1',
          sectionId: nurseryAId,
          subjectId: mathSubjectId, // Appropriate: Math for Nursery
          dayOfWeek: 1,
          periodNumber: 1,
          startTime: '09:00',
          endTime: '09:45',
          academicYearId,
        },
      });

      await prisma.timetablePeriod.create({
        data: {
          branchId: 'branch1',
          sectionId: nurseryAId,
          subjectId: physicsSubjectId, // Inappropriate: Physics for Nursery
          dayOfWeek: 1,
          periodNumber: 2,
          startTime: '09:45',
          endTime: '10:30',
          academicYearId,
        },
      });

      await prisma.timetablePeriod.create({
        data: {
          branchId: 'branch1',
          sectionId: class9AId,
          subjectId: physicsSubjectId, // Appropriate: Physics for Class 9
          dayOfWeek: 1,
          periodNumber: 1,
          startTime: '09:00',
          endTime: '09:45',
          academicYearId,
        },
      });
    });

    afterEach(async () => {
      // Clean up test periods
      await prisma.timetablePeriod.deleteMany({
        where: { branchId: 'branch1' },
      });
    });

    it('should return subject-teacher-class mapping with appropriateness validation', async () => {
      const response = await request(app.getHttpServer())
        .get('/subjects/subject-teacher-class-mapping')
        .set('x-branch-id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('inappropriateMappings');

      const { data, summary, inappropriateMappings } = response.body;
      
      // Should have 3 mappings: Math-Nursery (appropriate), Physics-Nursery (inappropriate), Physics-Class 9 (appropriate)
      expect(data).toHaveLength(3);
      
      // Check summary
      expect(summary.totalMappings).toBe(3);
      expect(summary.appropriateMappings).toBe(2);
      expect(summary.inappropriateMappings).toBe(1);

      // Check inappropriate mappings specifically
      expect(inappropriateMappings).toHaveLength(1);
      expect(inappropriateMappings[0]).toHaveProperty('subjectName', 'Physics');
      expect(inappropriateMappings[0]).toHaveProperty('className', 'Nursery');
      expect(inappropriateMappings[0]).toHaveProperty('isAppropriate', false);
      expect(inappropriateMappings[0]).toHaveProperty('validationMessage');

      // Check that appropriate mappings are marked correctly
      const appropriateMappings = data.filter(m => m.isAppropriate);
      expect(appropriateMappings).toHaveLength(2);
      
      const mathNurseryMapping = appropriateMappings.find(m => 
        m.subjectName === 'Mathematics' && m.className === 'Nursery'
      );
      expect(mathNurseryMapping).toBeDefined();
      
      const physicsClass9Mapping = appropriateMappings.find(m => 
        m.subjectName === 'Physics' && m.className === 'Class 9'
      );
      expect(physicsClass9Mapping).toBeDefined();
    });
  });

  describe('Multi-tenancy (Branch Isolation)', () => {
    let branch2ClassId: string;
    let branch2SubjectId: string;

    beforeEach(async () => {
      // Create test data for branch2
      const branch2Class = await prisma.class.create({
        data: {
          branchId: 'branch2',
          name: 'Nursery',
          gradeLevel: 0,
        },
      });
      branch2ClassId = branch2Class.id;

      const branch2Subject = await prisma.subject.create({
        data: {
          branchId: 'branch2',
          code: 'MATH_BR2',
          name: 'Mathematics',
          credits: 4,
          isElective: false,
        },
      });
      branch2SubjectId = branch2Subject.id;
    });

    afterEach(async () => {
      // Clean up branch2 test data
      await prisma.subject.deleteMany({
        where: { branchId: 'branch2' },
      });
      await prisma.class.deleteMany({
        where: { branchId: 'branch2' },
      });
    });

    it('should only return subjects for the current branch', async () => {
      const branch1Response = await request(app.getHttpServer())
        .get('/subjects/with-grade-filter')
        .query({ gradeLevel: '0' })
        .set('x-branch-id', 'branch1')
        .expect(200);

      const branch2Response = await request(app.getHttpServer())
        .get('/subjects/with-grade-filter')
        .query({ gradeLevel: '0' })
        .set('x-branch-id', 'branch2')
        .expect(200);

      const branch1SubjectCodes = branch1Response.body.data.map(s => s.code);
      const branch2SubjectCodes = branch2Response.body.data.map(s => s.code);

      expect(branch1SubjectCodes).toContain('MATH');
      expect(branch1SubjectCodes).not.toContain('MATH_BR2');

      expect(branch2SubjectCodes).toContain('MATH_BR2');
      expect(branch2SubjectCodes).not.toContain('MATH');
    });

    it('should validate assignments only within the same branch', async () => {
      // Should work for same branch
      await request(app.getHttpServer())
        .get(`/subjects/validate-assignment/${mathSubjectId}/${nurseryClassId}`)
        .set('x-branch-id', 'branch1')
        .expect(200);

      // Should fail for cross-branch validation (branch1 subject, branch2 class)
      const response = await request(app.getHttpServer())
        .get(`/subjects/validate-assignment/${mathSubjectId}/${branch2ClassId}`)
        .set('x-branch-id', 'branch1')
        .expect(200);

      expect(response.body).toHaveProperty('isValid', false);
      expect(response.body).toHaveProperty('message', 'Subject or class not found');
    });
  });
});