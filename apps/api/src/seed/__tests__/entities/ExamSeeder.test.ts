/**
 * ExamSeeder Tests - Direct Seeding
 * Tests exam generation for academic years
 */
import { ExamSeeder } from '../../entities/ExamSeeder';
import { TenantSeeder } from '../../entities/TenantSeeder';
import { AcademicYearSeeder } from '../../entities/AcademicYearSeeder';
import { SeedContext } from '../../core/interfaces';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run
describe('ExamSeeder - Direct Tests', () => {
  let seeder: ExamSeeder;
  let prisma: ReturnType<typeof getTestPrisma>;
  const testBranchId = 'test-direct-branch';
  beforeAll(async () => {
    prisma = getTestPrisma();
  });
  beforeEach(() => {
    seeder = new ExamSeeder();
  });
  afterEach(async () => {
    // Clean up after each test
    await prisma.mark.deleteMany({});
    await prisma.marksEntry.deleteMany({});
    await prisma.examSession.deleteMany({});
    await prisma.exam.deleteMany({});
    await prisma.academicYear.deleteMany({ where: { branchId: testBranchId } });
    await prisma.tenant.deleteMany({ where: { id: testBranchId } });
  });
  async function setupTestData(): Promise<SeedContext> {
    const context: SeedContext = {
      schoolId: 'test',
      branchId: testBranchId,
      options: { batchSize: 50, skipValidation: false, dryRun: false, verbose: false, parallel: false, maxRetries: 1 },
      prisma,
      createdEntities: new Map(),
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        progress: jest.fn(),
        metrics: jest.fn()
      } as any
    };
    // Create tenant
    const tenantSeeder = new TenantSeeder();
    const tenantResult = await tenantSeeder.seed(context);
    if (!tenantResult.success) {
      throw new Error(`Failed to create tenant: ${tenantResult.errors?.join(', ')}`);
    }
    // Create academic year
    const academicYearSeeder = new AcademicYearSeeder();
    const academicYearResult = await academicYearSeeder.seed(context);
    if (!academicYearResult.success) {
      throw new Error(`Failed to create academic year: ${academicYearResult.errors?.join(', ')}`);
    }
    return context;
  }
  describe('Basic Functionality', () => {
    it('should create exams', async () => {
      const context = await setupTestData();
      const result = await seeder.seed(context);
      // Debug log any errors
      if (result.errors) {
        console.log('Seeding errors:', result.errors);
      }
      expect(result.success).toBe(true);
      expect(result.metrics.totalRecords).toBeGreaterThan(0);
      // Verify exams were created
      const examCount = await prisma.exam.count();
      console.log(`Created ${examCount} exams`);
      expect(examCount).toBeGreaterThan(0);
    });
    it('should create exams with proper exam types', async () => {
      const context = await setupTestData();
      await seeder.seed(context);
      // Get all exams
      const exams = await prisma.exam.findMany({
        where: { branchId: testBranchId }
      });
      // Check exam types
      const examTypes = exams.map(e => e.examType);
      const validTypes = ['unit_test', 'mid_term', 'pre_board', 'annual', 'practical'];
      examTypes.forEach(type => {
        if (type) {
          expect(validTypes).toContain(type);
        }
      });
      // Should have variety of exam types
      expect(new Set(examTypes).size).toBeGreaterThan(1);
    });
    it('should link exams to academic year', async () => {
      const context = await setupTestData();
      await seeder.seed(context);
      // Get exams with academic year
      const exams = await prisma.exam.findMany({
        where: { branchId: testBranchId },
        include: { academicYear: true }
      });
      exams.forEach(exam => {
        expect(exam.academicYear).toBeDefined();
        expect(exam.academicYearId).toBe(exam.academicYear?.id);
      });
    });
    it('should set appropriate terms', async () => {
      const context = await setupTestData();
      await seeder.seed(context);
      // Get exams
      const exams = await prisma.exam.findMany({
        where: { branchId: testBranchId }
      });
      exams.forEach(exam => {
        if (exam.term !== null) {
          // Terms should be 1 or 2
          expect([1, 2]).toContain(exam.term);
        }
      });
      // Should have exams in both terms
      const terms = exams.map(e => e.term).filter(t => t !== null);
      expect(terms).toEqual(expect.arrayContaining([1, 2]));
    });
    it('should set proper weightage and marks', async () => {
      const context = await setupTestData();
      await seeder.seed(context);
      // Get exams
      const exams = await prisma.exam.findMany({
        where: { branchId: testBranchId }
      });
      exams.forEach(exam => {
        // Weightage should be between 0 and 100
        if (exam.weightagePercent !== null) {
          expect(exam.weightagePercent).toBeGreaterThan(0);
          expect(exam.weightagePercent).toBeLessThanOrEqual(100);
        }
        // Max marks should be positive
        if (exam.maxMarks !== null) {
          expect(exam.maxMarks).toBeGreaterThan(0);
        }
        // Min passing marks should be positive and less than max
        if (exam.minPassingMarks !== null && exam.maxMarks !== null) {
          expect(exam.minPassingMarks).toBeGreaterThan(0);
          expect(exam.minPassingMarks).toBeLessThan(exam.maxMarks);
        }
      });
    });
    it('should set exam status', async () => {
      const context = await setupTestData();
      await seeder.seed(context);
      // Get exams
      const exams = await prisma.exam.findMany({
        where: { branchId: testBranchId }
      });
      const statuses = exams.map(e => e.status);
      // Should have both completed and scheduled exams
      expect(statuses).toEqual(expect.arrayContaining(['COMPLETED', 'SCHEDULED']));
    });
    it('should set date ranges', async () => {
      const context = await setupTestData();
      await seeder.seed(context);
      // Get exams
      const exams = await prisma.exam.findMany({
        where: { branchId: testBranchId }
      });
      exams.forEach(exam => {
        if (exam.startDate && exam.endDate) {
          // Start date should be before or equal to end date
          const start = new Date(exam.startDate);
          const end = new Date(exam.endDate);
          expect(start.getTime()).toBeLessThanOrEqual(end.getTime());
        }
      });
    });
  });
  describe('Idempotency', () => {
    it('should not create duplicate exams on multiple runs', async () => {
      const context = await setupTestData();
      // First run
      const result1 = await seeder.seed(context);
      const count1 = await prisma.exam.count();
      // Second run
      const result2 = await seeder.seed(context);
      const count2 = await prisma.exam.count();
      // Should not create duplicates
      expect(count2).toBe(count1);
      expect(result2.metrics.totalRecords).toBe(0); // No new records created
    });
  });
  describe('Performance', () => {
    it('should efficiently create exams', async () => {
      const context = await setupTestData();
      const startTime = Date.now();
      const result = await seeder.seed(context);
      const duration = Date.now() - startTime;
      console.log(`Created ${result.metrics.successCount} exams in ${duration}ms`);
      // Should complete within reasonable time
      expect(duration).toBeLessThan(5000); // 5 seconds
    });
  });
});