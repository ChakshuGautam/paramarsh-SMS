/**
 * PaymentSeeder Tests - Direct Seeding
 * Tests payment generation for invoices
 */

import { PaymentSeeder } from '../../entities/PaymentSeeder';
import { TenantSeeder } from '../../entities/TenantSeeder';
import { ClassSeeder } from '../../entities/ClassSeeder';
import { StudentSeeder } from '../../entities/StudentSeeder';
import { AcademicYearSeeder } from '../../entities/AcademicYearSeeder';
import { EnrollmentSeeder } from '../../entities/EnrollmentSeeder';
import { FeeStructureSeeder } from '../../entities/FeeStructureSeeder';
import { FeeComponentSeeder } from '../../entities/FeeComponentSeeder';
import { FeeScheduleSeeder } from '../../entities/FeeScheduleSeeder';
import { InvoiceSeeder } from '../../entities/InvoiceSeeder';
import { SeedContext } from '../../core/interfaces';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run

describe('PaymentSeeder - Direct Tests', () => {
  let seeder: PaymentSeeder;
  let prisma: ReturnType<typeof getTestPrisma>;
  const testBranchId = 'test-direct-branch';

  beforeAll(async () => {
    prisma = getTestPrisma();
  });

  beforeEach(() => {
    seeder = new PaymentSeeder();
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

    // Create invoices
    const invoiceSeeder = new InvoiceSeeder();
    const invoiceResult = await invoiceSeeder.seed(context);
    if (!invoiceResult.success) {
      throw new Error(`Failed to create invoices: ${invoiceResult.errors?.join(', ')}`);
    }

    return context;
  }

  describe('Basic Functionality', () => {
    it('should create payments for paid invoices', async () => {
      const context = await setupTestData();
      
      const result = await seeder.seed(context);
      
      // Debug log any errors
      if (result.errors) {
        console.log('Seeding errors:', result.errors);
      }
      
      expect(result.success).toBe(true);
      
      // Verify payments were created
      const paymentCount = await prisma.payment.count();
      
      console.log(`Created ${paymentCount} payments`);
      
      // Should have created payments for paid invoices
      const paidInvoiceCount = await prisma.invoice.count({
        where: { 
          branchId: testBranchId,
          status: 'paid'
        }
      });
      
      if (paidInvoiceCount > 0) {
        expect(paymentCount).toBeGreaterThan(0);
      }
    });

    it('should create payments with unique references', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get all payments
      const payments = await prisma.payment.findMany({
        where: { branchId: testBranchId }
      });
      
      // Check all references are unique
      const references = payments.map(p => p.reference);
      const uniqueReferences = new Set(references);
      
      expect(uniqueReferences.size).toBe(references.length);
      
      // Check reference format
      payments.forEach(payment => {
        expect(payment.reference).toMatch(/^PAY-[A-Z-]+-\d{4}-\d{6}$/);
      });
    });

    it('should link payments to invoices', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get payments with invoice
      const payments = await prisma.payment.findMany({
        where: { branchId: testBranchId },
        include: { invoice: true }
      });
      
      payments.forEach(payment => {
        expect(payment.invoice).toBeDefined();
        expect(payment.invoiceId).toBe(payment.invoice.id);
      });
    });

    it('should set appropriate payment methods', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get payments
      const payments = await prisma.payment.findMany({
        where: { branchId: testBranchId }
      });
      
      const validMethods = [
        'online_banking',
        'credit_card',
        'debit_card',
        'upi',
        'cash',
        'cheque',
        'neft',
        'rtgs'
      ];
      
      payments.forEach(payment => {
        if (payment.method) {
          expect(validMethods).toContain(payment.method);
        }
      });
    });

    it('should set appropriate gateways', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get payments
      const payments = await prisma.payment.findMany({
        where: { branchId: testBranchId }
      });
      
      const validGateways = [
        'razorpay', 'paytm', 'phonepe', 'gpay',
        'stripe', 'bhim', 'manual', 'bank_transfer'
      ];
      
      payments.forEach(payment => {
        if (payment.gateway) {
          expect(validGateways).toContain(payment.gateway);
        }
      });
    });

    it('should match payment amount with invoice for full payments', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get fully paid invoices and their payments
      const paidInvoices = await prisma.invoice.findMany({
        where: { 
          branchId: testBranchId,
          status: 'paid'
        }
      });
      
      for (const invoice of paidInvoices) {
        const payment = await prisma.payment.findFirst({
          where: { invoiceId: invoice.id }
        });
        
        if (payment) {
          // Full payment should match invoice amount
          expect(payment.amount).toBe(invoice.amount);
        }
      }
    });

    it('should set payment status as completed', async () => {
      const context = await setupTestData();
      
      await seeder.seed(context);
      
      // Get payments
      const payments = await prisma.payment.findMany({
        where: { branchId: testBranchId }
      });
      
      payments.forEach(payment => {
        expect(payment.status).toBe('completed');
      });
    });
  });

  describe('Idempotency', () => {
    it('should not create duplicate payments on multiple runs', async () => {
      const context = await setupTestData();
      
      // First run
      const result1 = await seeder.seed(context);
      const count1 = await prisma.payment.count();
      
      // Second run
      const result2 = await seeder.seed(context);
      const count2 = await prisma.payment.count();
      
      // Should not create duplicates
      expect(count2).toBe(count1);
      expect(result2.metrics.totalRecords).toBe(0); // No new records created
    });

    it('should not create multiple payments for same invoice', async () => {
      const context = await setupTestData();
      
      // First run
      await seeder.seed(context);
      
      // Get invoices with payments
      const invoicesWithPayments = await prisma.invoice.findMany({
        where: {
          branchId: testBranchId,
          payments: {
            some: {}
          }
        },
        include: {
          payments: true
        }
      });
      
      // Each paid invoice should have exactly one payment
      // (pending invoices might have partial payments)
      invoicesWithPayments.forEach(invoice => {
        if (invoice.status === 'paid') {
          expect(invoice.payments.length).toBe(1);
        }
      });
    });
  });

  describe('Performance', () => {
    it('should efficiently create payments', async () => {
      const context = await setupTestData();
      
      const startTime = Date.now();
      const result = await seeder.seed(context);
      const duration = Date.now() - startTime;
      
      console.log(`Created ${result.metrics.successCount} payments in ${duration}ms`);
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(10000); // 10 seconds
    });
  });
});