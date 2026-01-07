import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Onboarding API (e2e) - TDD', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUserId: string;
  let testOnboardingStateId: string;

  beforeAll(async () => {
    process.env.PORT = '0';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        validationError: { target: false },
      }),
    );
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    testUserId = `test-user-${Date.now()}`;
  });

  afterAll(async () => {
    // Cleanup test data
    if (testOnboardingStateId) {
      await prisma.onboardingState.deleteMany({
        where: { userId: testUserId },
      });
    }
    await app.close();
  });

  afterEach(async () => {
    // Cleanup after each test to ensure isolation
    if (testOnboardingStateId) {
      // Cleanup demo data if created
      await prisma.student.deleteMany({
        where: { demoOnboardingId: testOnboardingStateId },
      });
      await prisma.teacher.deleteMany({
        where: { demoOnboardingId: testOnboardingStateId },
      });
      await prisma.attendanceRecord.deleteMany({
        where: {
          student: {
            demoOnboardingId: testOnboardingStateId,
          },
        },
      });
    }
  });

  describe('GET /api/onboarding/state', () => {
    it('should return existing onboarding state if found', async () => {
      // Create state directly in database
      const existingState = await prisma.onboardingState.create({
        data: {
          userId: testUserId,
          currentStep: 3,
          completedSteps: JSON.stringify([1, 2]),
          schoolName: 'Existing School',
        },
      });
      testOnboardingStateId = existingState.id;

      const response = await request(app.getHttpServer())
        .get('/api/onboarding/state')
        .set('X-User-Id', testUserId) // Mock Clerk auth
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', existingState.id);
      expect(response.body.data).toHaveProperty('userId', testUserId);
      expect(response.body.data).toHaveProperty('currentStep', 3);
      expect(response.body.data).toHaveProperty('schoolName', 'Existing School');
      expect(JSON.parse(response.body.data.completedSteps)).toEqual([1, 2]);
    });

    it('should create new onboarding state if not found', async () => {
      const newUserId = `new-user-${Date.now()}`;

      const response = await request(app.getHttpServer())
        .get('/api/onboarding/state')
        .set('X-User-Id', newUserId)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('userId', newUserId);
      expect(response.body.data).toHaveProperty('currentStep', 1);
      expect(response.body.data.completedSteps).toBeTruthy();
      expect(JSON.parse(response.body.data.completedSteps)).toEqual([]);

      // Cleanup
      await prisma.onboardingState.delete({
        where: { id: response.body.data.id },
      });
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/api/onboarding/state')
        // No X-User-Id header
        .expect(401);
    });

    it('should include all onboarding fields in response', async () => {
      const state = await prisma.onboardingState.create({
        data: {
          userId: `full-fields-${Date.now()}`,
          currentStep: 5,
          completedSteps: JSON.stringify([1, 2, 3, 4]),
          schoolName: 'Complete School',
          schoolType: 'private',
          location: 'Mumbai, Maharashtra',
          academicYear: '2024-25',
          logoUrl: 'https://example.com/logo.png',
          brandColor: '#0066cc',
          dashboardTourCompleted: true,
          rolesConfigured: true,
          classesConfigured: true,
          classesData: JSON.stringify({ classes: [] }),
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/onboarding/state')
        .set('X-User-Id', state.userId)
        .expect(200);

      const data = response.body.data;
      expect(data).toHaveProperty('schoolName', 'Complete School');
      expect(data).toHaveProperty('schoolType', 'private');
      expect(data).toHaveProperty('location', 'Mumbai, Maharashtra');
      expect(data).toHaveProperty('academicYear', '2024-25');
      expect(data).toHaveProperty('logoUrl', 'https://example.com/logo.png');
      expect(data).toHaveProperty('brandColor', '#0066cc');
      expect(data).toHaveProperty('dashboardTourCompleted', true);
      expect(data).toHaveProperty('rolesConfigured', true);
      expect(data).toHaveProperty('classesConfigured', true);

      // Cleanup
      await prisma.onboardingState.delete({ where: { id: state.id } });
    });
  });

  describe('POST /api/onboarding/school-setup', () => {
    beforeEach(async () => {
      // Create state for each test
      const state = await prisma.onboardingState.create({
        data: {
          userId: testUserId,
          currentStep: 1,
          completedSteps: JSON.stringify([]),
        },
      });
      testOnboardingStateId = state.id;
    });

    afterEach(async () => {
      // Cleanup
      if (testOnboardingStateId) {
        await prisma.onboardingState.delete({ where: { id: testOnboardingStateId } });
        testOnboardingStateId = null;
      }
    });

    it('should update school information with all required fields', async () => {
      const schoolData = {
        schoolName: 'Test International School',
        schoolType: 'private',
        location: 'Mumbai, Maharashtra',
        academicYear: '2024-25',
      };

      const response = await request(app.getHttpServer())
        .post('/api/onboarding/school-setup')
        .set('X-User-Id', testUserId)
        .send(schoolData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toMatchObject(schoolData);
      expect(response.body.data).toHaveProperty('currentStep', 2);
      expect(JSON.parse(response.body.data.completedSteps)).toContain(1);
    });

    it('should mark step 1 as complete and update currentStep to 2', async () => {
      const schoolData = {
        schoolName: 'Progressive School',
        schoolType: 'private',
        location: 'Delhi, India',
        academicYear: '2024-25',
      };

      const response = await request(app.getHttpServer())
        .post('/api/onboarding/school-setup')
        .set('X-User-Id', testUserId)
        .send(schoolData)
        .expect(200);

      expect(response.body.data.currentStep).toBe(2);
      const completedSteps = JSON.parse(response.body.data.completedSteps);
      expect(completedSteps).toContain(1);
      expect(completedSteps.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle optional fields (logoUrl, brandColor)', async () => {
      const schoolDataWithOptional = {
        schoolName: 'Modern School',
        schoolType: 'international',
        location: 'Bangalore, Karnataka',
        academicYear: '2024-25',
        logoUrl: 'https://example.com/logo.png',
        brandColor: '#0066cc',
      };

      const response = await request(app.getHttpServer())
        .post('/api/onboarding/school-setup')
        .set('X-User-Id', testUserId)
        .send(schoolDataWithOptional)
        .expect(200);

      expect(response.body.data).toMatchObject(schoolDataWithOptional);
      expect(response.body.data.logoUrl).toBe('https://example.com/logo.png');
      expect(response.body.data.brandColor).toBe('#0066cc');
    });

    it('should validate required field: schoolName', async () => {
      const invalidData = {
        // schoolName missing
        schoolType: 'private',
        location: 'Mumbai, Maharashtra',
        academicYear: '2024-25',
      };

      await request(app.getHttpServer())
        .post('/api/onboarding/school-setup')
        .set('X-User-Id', testUserId)
        .send(invalidData)
        .expect(400);
    });

    it('should validate required field: schoolType', async () => {
      const invalidData = {
        schoolName: 'Test School',
        // schoolType missing
        location: 'Mumbai, Maharashtra',
        academicYear: '2024-25',
      };

      await request(app.getHttpServer())
        .post('/api/onboarding/school-setup')
        .set('X-User-Id', testUserId)
        .send(invalidData)
        .expect(400);
    });

    it('should validate required field: location', async () => {
      const invalidData = {
        schoolName: 'Test School',
        schoolType: 'private',
        // location missing
        academicYear: '2024-25',
      };

      await request(app.getHttpServer())
        .post('/api/onboarding/school-setup')
        .set('X-User-Id', testUserId)
        .send(invalidData)
        .expect(400);
    });

    it('should validate required field: academicYear', async () => {
      const invalidData = {
        schoolName: 'Test School',
        schoolType: 'private',
        location: 'Mumbai, Maharashtra',
        // academicYear missing
      };

      await request(app.getHttpServer())
        .post('/api/onboarding/school-setup')
        .set('X-User-Id', testUserId)
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 for invalid data (empty schoolName)', async () => {
      const invalidData = {
        schoolName: '',
        schoolType: 'private',
        location: 'Mumbai, Maharashtra',
        academicYear: '2024-25',
      };

      await request(app.getHttpServer())
        .post('/api/onboarding/school-setup')
        .set('X-User-Id', testUserId)
        .send(invalidData)
        .expect(400);
    });

    it('should return data in React Admin format', async () => {
      const schoolData = {
        schoolName: 'Format Test School',
        schoolType: 'private',
        location: 'Chennai, Tamil Nadu',
        academicYear: '2024-25',
      };

      const response = await request(app.getHttpServer())
        .post('/api/onboarding/school-setup')
        .set('X-User-Id', testUserId)
        .send(schoolData)
        .expect(200);

      // Must have { data: OnboardingState } format
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('userId', testUserId);
    });
  });

  describe('POST /api/onboarding/dashboard-tour', () => {
    beforeEach(async () => {
      const state = await prisma.onboardingState.create({
        data: {
          userId: testUserId,
          currentStep: 2,
          completedSteps: JSON.stringify([1]),
          schoolName: 'Test School',
          schoolType: 'private',
          location: 'Mumbai, Maharashtra',
          academicYear: '2024-25',
        },
      });
      testOnboardingStateId = state.id;
    });

    afterEach(async () => {
      if (testOnboardingStateId) {
        await prisma.onboardingState.delete({ where: { id: testOnboardingStateId } });
        testOnboardingStateId = null;
      }
    });

    it('should generate demo data', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/onboarding/dashboard-tour')
        .set('X-User-Id', testUserId)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('demoDataSummary');
      expect(response.body.demoDataSummary).toHaveProperty('studentsCreated');
      expect(response.body.demoDataSummary).toHaveProperty('teachersCreated');
      expect(response.body.demoDataSummary.studentsCreated).toBeGreaterThan(0);
      expect(response.body.demoDataSummary.teachersCreated).toBeGreaterThan(0);
    });

    it('should mark step 2 complete and update currentStep to 3', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/onboarding/dashboard-tour')
        .set('X-User-Id', testUserId)
        .expect(200);

      expect(response.body.data.currentStep).toBe(3);
      const completedSteps = JSON.parse(response.body.data.completedSteps);
      expect(completedSteps).toContain(2);
      expect(response.body.data.dashboardTourCompleted).toBe(true);
    });

    it('should return demo data summary with realistic counts', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/onboarding/dashboard-tour')
        .set('X-User-Id', testUserId)
        .expect(200);

      const summary = response.body.demoDataSummary;
      expect(summary.studentsCreated).toBeGreaterThanOrEqual(50);
      expect(summary.teachersCreated).toBeGreaterThanOrEqual(10);
      expect(summary.classesCreated).toBeGreaterThanOrEqual(5);
    });

    it('should return data in React Admin format with demoDataSummary', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/onboarding/dashboard-tour')
        .set('X-User-Id', testUserId)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body).toHaveProperty('demoDataSummary');
      expect(typeof response.body.demoDataSummary).toBe('object');
    });
  });

  describe('POST /api/onboarding/user-roles', () => {
    beforeEach(async () => {
      const state = await prisma.onboardingState.create({
        data: {
          userId: testUserId,
          currentStep: 3,
          completedSteps: JSON.stringify([1, 2]),
          dashboardTourCompleted: true,
        },
      });
      testOnboardingStateId = state.id;
    });

    afterEach(async () => {
      if (testOnboardingStateId) {
        await prisma.onboardingState.delete({ where: { id: testOnboardingStateId } });
        testOnboardingStateId = null;
      }
    });

    it('should mark rolesConfigured as true', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/onboarding/user-roles')
        .set('X-User-Id', testUserId)
        .expect(200);

      expect(response.body.data.rolesConfigured).toBe(true);
    });

    it('should mark step 3 complete and update currentStep to 4', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/onboarding/user-roles')
        .set('X-User-Id', testUserId)
        .expect(200);

      expect(response.body.data.currentStep).toBe(4);
      const completedSteps = JSON.parse(response.body.data.completedSteps);
      expect(completedSteps).toContain(3);
    });

    it('should return data in React Admin format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/onboarding/user-roles')
        .set('X-User-Id', testUserId)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('userId', testUserId);
    });
  });

  describe('POST /api/onboarding/classes', () => {
    beforeEach(async () => {
      const state = await prisma.onboardingState.create({
        data: {
          userId: testUserId,
          currentStep: 4,
          completedSteps: JSON.stringify([1, 2, 3]),
          rolesConfigured: true,
        },
      });
      testOnboardingStateId = state.id;
    });

    afterEach(async () => {
      if (testOnboardingStateId) {
        await prisma.onboardingState.delete({ where: { id: testOnboardingStateId } });
        testOnboardingStateId = null;
      }
    });

    it('should save classes data', async () => {
      const classesData = {
        classes: [
          { grade: '8', section: 'A', capacity: 40 },
          { grade: '8', section: 'B', capacity: 35 },
          { grade: '9', section: 'A', capacity: 38 },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/api/onboarding/classes')
        .set('X-User-Id', testUserId)
        .send(classesData)
        .expect(200);

      expect(response.body.data.classesConfigured).toBe(true);
      expect(response.body.data.classesData).toBeTruthy();
      const savedClasses = JSON.parse(response.body.data.classesData);
      expect(savedClasses).toMatchObject(classesData);
    });

    it('should mark step 4 complete', async () => {
      const classesData = {
        classes: [
          { grade: '10', section: 'A', capacity: 30 },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/api/onboarding/classes')
        .set('X-User-Id', testUserId)
        .send(classesData)
        .expect(200);

      expect(response.body.data.currentStep).toBe(5);
      const completedSteps = JSON.parse(response.body.data.completedSteps);
      expect(completedSteps).toContain(4);
    });

    it('should validate classes structure - must be an object', async () => {
      const invalidData = 'not an object';

      await request(app.getHttpServer())
        .post('/api/onboarding/classes')
        .set('X-User-Id', testUserId)
        .send(invalidData)
        .expect(400);
    });

    it('should validate classes structure - must have classes array', async () => {
      const invalidData = {
        // classes array missing
        other: 'data',
      };

      await request(app.getHttpServer())
        .post('/api/onboarding/classes')
        .set('X-User-Id', testUserId)
        .send(invalidData)
        .expect(400);
    });

    it('should validate classes structure - classes must be array', async () => {
      const invalidData = {
        classes: 'not an array',
      };

      await request(app.getHttpServer())
        .post('/api/onboarding/classes')
        .set('X-User-Id', testUserId)
        .send(invalidData)
        .expect(400);
    });

    it('should validate classes structure - array cannot be empty', async () => {
      const invalidData = {
        classes: [],
      };

      await request(app.getHttpServer())
        .post('/api/onboarding/classes')
        .set('X-User-Id', testUserId)
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        classes: [
          { grade: '', section: 'A', capacity: 40 }, // empty grade
        ],
      };

      await request(app.getHttpServer())
        .post('/api/onboarding/classes')
        .set('X-User-Id', testUserId)
        .send(invalidData)
        .expect(400);
    });

    it('should return data in React Admin format', async () => {
      const classesData = {
        classes: [
          { grade: '7', section: 'A', capacity: 35 },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/api/onboarding/classes')
        .set('X-User-Id', testUserId)
        .send(classesData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('userId', testUserId);
    });
  });

  describe('POST /api/onboarding/timetable', () => {
    beforeEach(async () => {
      const state = await prisma.onboardingState.create({
        data: {
          userId: testUserId,
          currentStep: 5,
          completedSteps: JSON.stringify([1, 2, 3, 4]),
          classesConfigured: true,
        },
      });
      testOnboardingStateId = state.id;
    });

    afterEach(async () => {
      if (testOnboardingStateId) {
        await prisma.onboardingState.delete({ where: { id: testOnboardingStateId } });
        testOnboardingStateId = null;
      }
    });

    it('should save timetable config', async () => {
      const timetableConfig = {
        workingHours: {
          start: '08:00',
          end: '15:00',
        },
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        periodsPerDay: 6,
        periodDuration: 45,
      };

      const response = await request(app.getHttpServer())
        .post('/api/onboarding/timetable')
        .set('X-User-Id', testUserId)
        .send(timetableConfig)
        .expect(200);

      expect(response.body.data.timetableGenerated).toBe(true);
      expect(response.body.data.timetableData).toBeTruthy();
      const savedConfig = JSON.parse(response.body.data.timetableData);
      expect(savedConfig).toMatchObject(timetableConfig);
    });

    it('should mark step 5 complete', async () => {
      const timetableConfig = {
        workingHours: { start: '09:00', end: '16:00' },
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      };

      const response = await request(app.getHttpServer())
        .post('/api/onboarding/timetable')
        .set('X-User-Id', testUserId)
        .send(timetableConfig)
        .expect(200);

      expect(response.body.data.currentStep).toBe(6);
      const completedSteps = JSON.parse(response.body.data.completedSteps);
      expect(completedSteps).toContain(5);
    });

    it('should validate timetable structure - must have workingHours', async () => {
      const invalidData = {
        workingDays: ['Monday', 'Tuesday'],
        // workingHours missing
      };

      await request(app.getHttpServer())
        .post('/api/onboarding/timetable')
        .set('X-User-Id', testUserId)
        .send(invalidData)
        .expect(400);
    });

    it('should validate timetable structure - must have workingDays', async () => {
      const invalidData = {
        workingHours: { start: '08:00', end: '15:00' },
        // workingDays missing
      };

      await request(app.getHttpServer())
        .post('/api/onboarding/timetable')
        .set('X-User-Id', testUserId)
        .send(invalidData)
        .expect(400);
    });

    it('should validate time format (HH:MM)', async () => {
      const invalidData = {
        workingHours: {
          start: '8:00', // Invalid format (should be 08:00)
          end: '15:00',
        },
        workingDays: ['Monday'],
      };

      await request(app.getHttpServer())
        .post('/api/onboarding/timetable')
        .set('X-User-Id', testUserId)
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        workingHours: {
          start: '08:00',
          end: '25:00', // Invalid hour
        },
        workingDays: [],
      };

      await request(app.getHttpServer())
        .post('/api/onboarding/timetable')
        .set('X-User-Id', testUserId)
        .send(invalidData)
        .expect(400);
    });

    it('should return data in React Admin format', async () => {
      const timetableConfig = {
        workingHours: { start: '08:30', end: '14:30' },
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      };

      const response = await request(app.getHttpServer())
        .post('/api/onboarding/timetable')
        .set('X-User-Id', testUserId)
        .send(timetableConfig)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('userId', testUserId);
    });
  });

  describe('POST /api/onboarding/attendance', () => {
    beforeEach(async () => {
      const state = await prisma.onboardingState.create({
        data: {
          userId: testUserId,
          currentStep: 6,
          completedSteps: JSON.stringify([1, 2, 3, 4, 5]),
          timetableGenerated: true,
        },
      });
      testOnboardingStateId = state.id;
    });

    afterEach(async () => {
      if (testOnboardingStateId) {
        await prisma.onboardingState.delete({ where: { id: testOnboardingStateId } });
        testOnboardingStateId = null;
      }
    });

    it('should mark step 6 complete', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/onboarding/attendance')
        .set('X-User-Id', testUserId)
        .expect(200);

      expect(response.body.data.attendanceConfigured).toBe(true);
      expect(response.body.data.currentStep).toBe(7);
      const completedSteps = JSON.parse(response.body.data.completedSteps);
      expect(completedSteps).toContain(6);
    });

    it('should update currentStep to 7', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/onboarding/attendance')
        .set('X-User-Id', testUserId)
        .expect(200);

      expect(response.body.data.currentStep).toBe(7);
    });

    it('should return data in React Admin format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/onboarding/attendance')
        .set('X-User-Id', testUserId)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('userId', testUserId);
    });
  });

  describe('POST /api/onboarding/fees', () => {
    beforeEach(async () => {
      const state = await prisma.onboardingState.create({
        data: {
          userId: testUserId,
          currentStep: 7,
          completedSteps: JSON.stringify([1, 2, 3, 4, 5, 6]),
          attendanceConfigured: true,
        },
      });
      testOnboardingStateId = state.id;
    });

    afterEach(async () => {
      if (testOnboardingStateId) {
        await prisma.onboardingState.delete({ where: { id: testOnboardingStateId } });
        testOnboardingStateId = null;
      }
    });

    it('should save fee data', async () => {
      const feeData = {
        structures: [
          { name: 'Tuition Fee', amount: 50000, frequency: 'quarterly' },
          { name: 'Transport Fee', amount: 10000, frequency: 'quarterly' },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/api/onboarding/fees')
        .set('X-User-Id', testUserId)
        .send(feeData)
        .expect(200);

      expect(response.body.data.feeStructureConfigured).toBe(true);
      expect(response.body.data.feeStructureData).toBeTruthy();
    });

    it('should mark step 7 complete', async () => {
      const feeData = {
        structures: [
          { name: 'Annual Fee', amount: 100000, frequency: 'annual' },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/api/onboarding/fees')
        .set('X-User-Id', testUserId)
        .send(feeData)
        .expect(200);

      expect(response.body.data.currentStep).toBe(8);
      const completedSteps = JSON.parse(response.body.data.completedSteps);
      expect(completedSteps).toContain(7);
    });

    it('should validate fee structure', async () => {
      const invalidData = 'not valid';

      await request(app.getHttpServer())
        .post('/api/onboarding/fees')
        .set('X-User-Id', testUserId)
        .send(invalidData)
        .expect(400);
    });

    it('should return data in React Admin format', async () => {
      const feeData = {
        structures: [
          { name: 'Test Fee', amount: 5000, frequency: 'monthly' },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/api/onboarding/fees')
        .set('X-User-Id', testUserId)
        .send(feeData)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('userId', testUserId);
    });
  });

  describe('POST /api/onboarding/reports', () => {
    beforeEach(async () => {
      const state = await prisma.onboardingState.create({
        data: {
          userId: testUserId,
          currentStep: 8,
          completedSteps: JSON.stringify([1, 2, 3, 4, 5, 6, 7]),
          feeStructureConfigured: true,
        },
      });
      testOnboardingStateId = state.id;
    });

    afterEach(async () => {
      if (testOnboardingStateId) {
        await prisma.onboardingState.delete({ where: { id: testOnboardingStateId } });
        testOnboardingStateId = null;
      }
    });

    it('should mark step 8 complete', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/onboarding/reports')
        .set('X-User-Id', testUserId)
        .expect(200);

      expect(response.body.data.reportsViewed).toBe(true);
      expect(response.body.data.currentStep).toBe(9);
      const completedSteps = JSON.parse(response.body.data.completedSteps);
      expect(completedSteps).toContain(8);
    });

    it('should update currentStep to 9', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/onboarding/reports')
        .set('X-User-Id', testUserId)
        .expect(200);

      expect(response.body.data.currentStep).toBe(9);
    });

    it('should return data in React Admin format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/onboarding/reports')
        .set('X-User-Id', testUserId)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('userId', testUserId);
    });
  });

  describe('POST /api/onboarding/complete', () => {
    let testBranchId: string;

    beforeEach(async () => {
      const state = await prisma.onboardingState.create({
        data: {
          userId: testUserId,
          currentStep: 9,
          completedSteps: JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8]),
          schoolName: 'Complete Test School',
          schoolType: 'private',
          location: 'Pune, Maharashtra',
          academicYear: '2024-25',
          reportsViewed: true,
        },
      });
      testOnboardingStateId = state.id;
    });

    afterEach(async () => {
      if (testOnboardingStateId) {
        await prisma.onboardingState.delete({ where: { id: testOnboardingStateId } });
        testOnboardingStateId = null;
      }
      if (testBranchId) {
        await prisma.branch.deleteMany({ where: { id: testBranchId } });
        testBranchId = null;
      }
    });

    it('should create new branch for the school', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/onboarding/complete')
        .set('X-User-Id', testUserId)
        .expect(200);

      expect(response.body.data.branchId).toBeTruthy();
      testBranchId = response.body.data.branchId;

      // Verify branch was created
      const branch = await prisma.branch.findUnique({
        where: { id: testBranchId },
      });
      expect(branch).toBeTruthy();
      expect(branch.onboardingCompleted).toBe(true);
    });

    it('should cleanup demo data', async () => {
      // Create some demo data first
      await prisma.student.create({
        data: {
          id: `demo-student-${testOnboardingStateId}-cleanup`,
          branchId: 'demo-branch',
          firstName: 'Demo',
          lastName: 'Student',
          isDemo: true,
          demoOnboardingId: testOnboardingStateId,
        },
      });

      const response = await request(app.getHttpServer())
        .post('/api/onboarding/complete')
        .set('X-User-Id', testUserId)
        .expect(200);

      testBranchId = response.body.data.branchId;

      // Verify demo data was cleaned up
      const demoStudents = await prisma.student.findMany({
        where: { demoOnboardingId: testOnboardingStateId },
      });
      expect(demoStudents.length).toBe(0);
    });

    it('should mark onboarding completed', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/onboarding/complete')
        .set('X-User-Id', testUserId)
        .expect(200);

      expect(response.body.data.completed).toBe(true);
      expect(response.body.data.completedAt).toBeTruthy();
      testBranchId = response.body.data.branchId;
    });

    it('should set completedAt timestamp', async () => {
      const beforeTime = new Date();

      const response = await request(app.getHttpServer())
        .post('/api/onboarding/complete')
        .set('X-User-Id', testUserId)
        .expect(200);

      const afterTime = new Date();
      const completedAt = new Date(response.body.data.completedAt);

      expect(completedAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(completedAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
      testBranchId = response.body.data.branchId;
    });

    it('should return final state with branchId', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/onboarding/complete')
        .set('X-User-Id', testUserId)
        .expect(200);

      expect(response.body.data.branchId).toBeTruthy();
      expect(response.body.data.completed).toBe(true);
      expect(response.body.data.currentStep).toBe(9);
      testBranchId = response.body.data.branchId;
    });

    it('should return data in React Admin format with message', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/onboarding/complete')
        .set('X-User-Id', testUserId)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'Onboarding completed');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('userId', testUserId);
      expect(response.body.data).toHaveProperty('branchId');
      testBranchId = response.body.data.branchId;
    });
  });

  describe('Idempotency Tests', () => {
    beforeEach(async () => {
      const state = await prisma.onboardingState.create({
        data: {
          userId: testUserId,
          currentStep: 1,
          completedSteps: JSON.stringify([]),
        },
      });
      testOnboardingStateId = state.id;
    });

    afterEach(async () => {
      if (testOnboardingStateId) {
        await prisma.onboardingState.delete({ where: { id: testOnboardingStateId } });
        testOnboardingStateId = null;
      }
    });

    it('should handle calling school-setup endpoint multiple times', async () => {
      const schoolData = {
        schoolName: 'Idempotency Test School',
        schoolType: 'private',
        location: 'Hyderabad, Telangana',
        academicYear: '2024-25',
      };

      // First call
      const response1 = await request(app.getHttpServer())
        .post('/api/onboarding/school-setup')
        .set('X-User-Id', testUserId)
        .send(schoolData)
        .expect(200);

      // Second call with same data
      const response2 = await request(app.getHttpServer())
        .post('/api/onboarding/school-setup')
        .set('X-User-Id', testUserId)
        .send(schoolData)
        .expect(200);

      // Should not duplicate step 1 in completedSteps
      const completedSteps = JSON.parse(response2.body.data.completedSteps);
      const step1Count = completedSteps.filter((s: number) => s === 1).length;
      expect(step1Count).toBe(1);
    });

    it('should handle calling user-roles endpoint multiple times', async () => {
      // Setup to step 3
      await prisma.onboardingState.update({
        where: { id: testOnboardingStateId },
        data: {
          currentStep: 3,
          completedSteps: JSON.stringify([1, 2]),
        },
      });

      // First call
      await request(app.getHttpServer())
        .post('/api/onboarding/user-roles')
        .set('X-User-Id', testUserId)
        .expect(200);

      // Second call
      const response2 = await request(app.getHttpServer())
        .post('/api/onboarding/user-roles')
        .set('X-User-Id', testUserId)
        .expect(200);

      // Should not duplicate step 3
      const completedSteps = JSON.parse(response2.body.data.completedSteps);
      const step3Count = completedSteps.filter((s: number) => s === 3).length;
      expect(step3Count).toBe(1);
    });
  });

  describe('Complete Flow End-to-End', () => {
    let flowUserId: string;
    let flowStateId: string;
    let flowBranchId: string;

    beforeAll(() => {
      flowUserId = `flow-test-${Date.now()}`;
    });

    afterAll(async () => {
      // Cleanup
      if (flowBranchId) {
        await prisma.branch.deleteMany({ where: { id: flowBranchId } });
      }
      if (flowStateId) {
        await prisma.onboardingState.deleteMany({ where: { userId: flowUserId } });
      }
    });

    it('should complete entire onboarding flow from step 1 to 9', async () => {
      // Step 1: Get state (creates new)
      const stateResponse = await request(app.getHttpServer())
        .get('/api/onboarding/state')
        .set('X-User-Id', flowUserId)
        .expect(200);

      flowStateId = stateResponse.body.data.id;
      expect(stateResponse.body.data.currentStep).toBe(1);

      // Step 1: School Setup
      const schoolResponse = await request(app.getHttpServer())
        .post('/api/onboarding/school-setup')
        .set('X-User-Id', flowUserId)
        .send({
          schoolName: 'Complete Flow School',
          schoolType: 'private',
          location: 'Jaipur, Rajasthan',
          academicYear: '2024-25',
        })
        .expect(200);

      expect(schoolResponse.body.data.currentStep).toBe(2);

      // Step 2: Dashboard Tour
      const tourResponse = await request(app.getHttpServer())
        .post('/api/onboarding/dashboard-tour')
        .set('X-User-Id', flowUserId)
        .expect(200);

      expect(tourResponse.body.data.currentStep).toBe(3);
      expect(tourResponse.body.demoDataSummary).toBeTruthy();

      // Step 3: User Roles
      const rolesResponse = await request(app.getHttpServer())
        .post('/api/onboarding/user-roles')
        .set('X-User-Id', flowUserId)
        .expect(200);

      expect(rolesResponse.body.data.currentStep).toBe(4);

      // Step 4: Classes
      const classesResponse = await request(app.getHttpServer())
        .post('/api/onboarding/classes')
        .set('X-User-Id', flowUserId)
        .send({
          classes: [
            { grade: '8', section: 'A', capacity: 40 },
            { grade: '9', section: 'A', capacity: 35 },
          ],
        })
        .expect(200);

      expect(classesResponse.body.data.currentStep).toBe(5);

      // Step 5: Timetable
      const timetableResponse = await request(app.getHttpServer())
        .post('/api/onboarding/timetable')
        .set('X-User-Id', flowUserId)
        .send({
          workingHours: { start: '08:00', end: '15:00' },
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        })
        .expect(200);

      expect(timetableResponse.body.data.currentStep).toBe(6);

      // Step 6: Attendance
      const attendanceResponse = await request(app.getHttpServer())
        .post('/api/onboarding/attendance')
        .set('X-User-Id', flowUserId)
        .expect(200);

      expect(attendanceResponse.body.data.currentStep).toBe(7);

      // Step 7: Fees
      const feesResponse = await request(app.getHttpServer())
        .post('/api/onboarding/fees')
        .set('X-User-Id', flowUserId)
        .send({
          structures: [
            { name: 'Tuition', amount: 50000, frequency: 'quarterly' },
          ],
        })
        .expect(200);

      expect(feesResponse.body.data.currentStep).toBe(8);

      // Step 8: Reports
      const reportsResponse = await request(app.getHttpServer())
        .post('/api/onboarding/reports')
        .set('X-User-Id', flowUserId)
        .expect(200);

      expect(reportsResponse.body.data.currentStep).toBe(9);

      // Step 9: Complete
      const completeResponse = await request(app.getHttpServer())
        .post('/api/onboarding/complete')
        .set('X-User-Id', flowUserId)
        .expect(200);

      expect(completeResponse.body.data.completed).toBe(true);
      expect(completeResponse.body.data.branchId).toBeTruthy();
      expect(completeResponse.body.message).toBe('Onboarding completed');

      flowBranchId = completeResponse.body.data.branchId;

      // Verify all 9 steps are completed
      const completedSteps = JSON.parse(completeResponse.body.data.completedSteps);
      expect(completedSteps).toContain(1);
      expect(completedSteps).toContain(2);
      expect(completedSteps).toContain(3);
      expect(completedSteps).toContain(4);
      expect(completedSteps).toContain(5);
      expect(completedSteps).toContain(6);
      expect(completedSteps).toContain(7);
      expect(completedSteps).toContain(8);
      expect(completedSteps).toContain(9);
    });
  });
});
