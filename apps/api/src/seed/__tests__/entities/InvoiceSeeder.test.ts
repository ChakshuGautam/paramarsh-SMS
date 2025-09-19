/**
 * InvoiceSeeder Tests - Direct Seeding
 * Tests invoice generation for students based on fee schedules
 */

import { InvoiceSeeder } from '../../entities/InvoiceSeeder';
import { TenantSeeder } from '../../entities/TenantSeeder';
import { ClassSeeder } from '../../entities/ClassSeeder';
import { StudentSeeder } from '../../entities/StudentSeeder';
import { AcademicYearSeeder } from '../../entities/AcademicYearSeeder';
import { EnrollmentSeeder } from '../../entities/EnrollmentSeeder';
import { FeeStructureSeeder } from '../../entities/FeeStructureSeeder';
import { FeeComponentSeeder } from '../../entities/FeeComponentSeeder';
import { FeeScheduleSeeder } from '../../entities/FeeScheduleSeeder';
import { SeedContext } from '../../core/interfaces';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run

describe('InvoiceSeeder - Direct Tests', () => {
  let seeder: InvoiceSeeder;
  let prisma: ReturnType<typeof getTestPrisma>;
  const testBranchId = 'test-direct-branch';

  beforeAll(async () => {
    prisma = getTestPrisma();
  });

  beforeEach(() => {
    seeder = new InvoiceSeeder();
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.payment.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.feeSchedule.deleteMany({});
    await prisma.feeComponent.deleteMany({});
    await prisma.feeStructure.deleteMany({});
    await prisma.enrollment.deleteMany({ where: { branchId: testBranchId } });
    await prisma.student.deleteMany({ where: { branchId: testBranchId } });
    await prisma.academicYear.deleteMany({ where: { branchId: testBranchId } });
    await prisma.section.deleteMany({ where: { branchId: testBranchId } });
    await prisma.class.deleteMany({ where: { branchId: testBranchId } });
    await prisma.tenant.deleteMany({ where: { id: testBranchId } });
  });

  async function setupTestData(): Promise<SeedContext> {
    const context: SeedContext = {
      branchId: testBranchId,
      prisma,
      createdEntities: new Map(),
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        progress: jest.fn()
      } as any
    };

    // Create tenant
    const tenantSeeder = new TenantSeeder();
    const tenantResult = await tenantSeeder.seed(context);
    if (!tenantResult.success) {
      throw new Error(`Failed to create tenant: ${tenantResult.errors?.join(', ')}`);
    }

    // Create classes
    const classSeeder = new ClassSeeder();
    const classResult = await classSeeder.seed(context);
    if (!classResult.success) {
      throw new Error(`Failed to create classes: ${classResult.errors?.join(', ')}`);
    }

    // Create academic year
    const academicYearSeeder = new AcademicYearSeeder();
    const academicYearResult = await academicYearSeeder.seed(context);
    if (!academicYearResult.success) {
      throw new Error(`Failed to create academic year: ${academicYearResult.errors?.join(', ')}`);
    }

    // Create students
    const studentSeeder = new StudentSeeder();
    const studentResult = await studentSeeder.seed(context);
    if (!studentResult.success) {
      throw new Error(`Failed to create students: ${studentResult.errors?.join(', ')}`);
    }

    // Create enrollments
    const enrollmentSeeder = new EnrollmentSeeder();
    const enrollmentResult = await enrollmentSeeder.seed(context);
    if (!enrollmentResult.success) {
      throw new Error(`Failed to create enrollments: ${enrollmentResult.errors?.join(', ')}`);
    }

    // Create fee structures
    const feeStructureSeeder = new FeeStructureSeeder();
    const structureResult = await feeStructureSeeder.seed(context);
    if (!structureResult.success) {
      throw new Error(`Failed to create fee structures: ${structureResult.errors?.join(', ')}`);
    }

    // Create fee components
    const feeComponentSeeder = new FeeComponentSeeder();
    const componentResult = await feeComponentSeeder.seed(context);
    if (!componentResult.success) {
      throw new Error(`Failed to create fee components: ${componentResult.errors?.join(', ')}`);
    }

    // Create fee schedules
    const feeScheduleSeeder = new FeeScheduleSeeder();
    const scheduleResult = await feeScheduleSeeder.seed(context);
    if (!scheduleResult.success) {
      throw new Error(`Failed to create fee schedules: ${scheduleResult.errors?.join(', ')}`);
    }

    return context;
  }

  describe('Basic Functionality', () => {
    it('should create invoices', async () => {
      const context = await setupTestData();
      
      const result = await seeder.seed(context);
      
      // Debug log any errors
      if (result.errors) {
        console.log('Seeding errors:', result.errors);
      }
      
      expect(result.success).toBe(true);
      expect(result.metrics.totalRecords).toBeGreaterThan(0);
      
      // Verify invoices were created
      const invoiceCount = await prisma.invoice.count();
      
      console.log(`Created ${invoiceCount} invoices`);
      expect(invoiceCount).toBeGreaterThan(0);
    });

    it('should create invoices with unique invoice numbers', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get all invoices
      const invoices = await prisma.invoice.findMany({
        where: { branchId: testBranchId }
      });
      
      // Check all invoice numbers are unique
      const invoiceNumbers = invoices.map(i => i.invoiceNumber);
      const uniqueNumbers = new Set(invoiceNumbers);
      
      expect(uniqueNumbers.size).toBe(invoiceNumbers.length);
      
      // Check invoice number format
      invoices.forEach(invoice => {
        expect(invoice.invoiceNumber).toMatch(/^INV-[A-Z-]+-\d{4}-\d{5}$/);
      });
    });

    it('should link invoices to students', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get invoices with student
      const invoices = await prisma.invoice.findMany({
        where: { branchId: testBranchId },
        include: { student: true }
      });
      
      invoices.forEach(invoice => {
        expect(invoice.student).toBeDefined();
        expect(invoice.studentId).toBe(invoice.student.id);
      });
    });

    it('should set appropriate periods based on schedule', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get invoices
      const invoices = await prisma.invoice.findMany({
        where: { branchId: testBranchId }
      });
      
      invoices.forEach(invoice => {
        expect(invoice.period).toBeDefined();
        // Period should be in format YYYY-MM, YYYY-QN, or YYYY-ADMISSION
        expect(invoice.period).toMatch(/^\d{4}-(0[1-9]|1[0-2]|Q[1-4]|ADMISSION)$/);
      });
    });

    it('should calculate amounts from fee components', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get invoices
      const invoices = await prisma.invoice.findMany({
        where: { branchId: testBranchId }
      });
      
      invoices.forEach(invoice => {
        // Amount should be positive
        expect(invoice.amount).toBeGreaterThan(0);
        // Reasonable range for fees (100 to 100000)
        expect(invoice.amount).toBeGreaterThanOrEqual(100);
        expect(invoice.amount).toBeLessThanOrEqual(100000);
      });
    });

    it('should set invoice status appropriately', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get invoices
      const invoices = await prisma.invoice.findMany({
        where: { branchId: testBranchId }
      });
      
      const statuses = invoices.map(i => i.status);
      
      // Should have various statuses
      expect(statuses).toEqual(expect.arrayContaining(['pending', 'paid']));
      
      // Valid status values
      invoices.forEach(invoice => {
        expect(['pending', 'paid', 'overdue']).toContain(invoice.status);
      });
    });

    it('should set due dates based on schedule', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get invoices
      const invoices = await prisma.invoice.findMany({
        where: { branchId: testBranchId }
      });
      
      invoices.forEach(invoice => {
        if (invoice.dueDate) {
          // Due date should be in YYYY-MM-DD format
          expect(invoice.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
      });
    });
  });

  describe('Idempotency', () => {
    it('should not create duplicate invoices on multiple runs', async () => {
      const context = await setupTestData();
      
      // First run
      const result1 = await seeder.seed(context);
      const count1 = await prisma.invoice.count();
      
      // Second run
      const result2 = await seeder.seed(context);
      const count2 = await prisma.invoice.count();
      
      // Should not create duplicates
      expect(count2).toBe(count1);
      expect(result2.metrics.totalRecords).toBe(0); // No new records created
    });

    it('should not create duplicate invoices for same student-period', async () => {
      const context = await setupTestData();
      
      // First run
      await seeder.seed(context);
      
      // Get an invoice
      const invoice = await prisma.invoice.findFirst({
        where: { branchId: testBranchId }
      });
      
      // Try to create duplicate
      let error;
      try {
        await prisma.invoice.create({
          data: {
            branchId: testBranchId,
            invoiceNumber: 'INV-TEST-2024-99999',
            studentId: invoice!.studentId,
            period: invoice!.period,
            amount: 5000,
            status: 'pending'
          }
        });
      } catch (e) {
        error = e;
      }
      
      // Should throw unique constraint violation
      expect(error).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should efficiently create invoices', async () => {
      const context = await setupTestData();
      
      const startTime = Date.now();
      const result = await seeder.seed(context);
      const duration = Date.now() - startTime;
      
      console.log(`Created ${result.metrics.successCount} invoices in ${duration}ms`);
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(15000); // 15 seconds
    });
  });
});