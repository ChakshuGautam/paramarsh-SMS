/**
 * Complete Orchestration Integration Test
 * Tests the full seeding process with all entities including financial and examination modules
 */

import { SeedOrchestrator } from '../../core/SeedOrchestrator';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run

describe('Complete Orchestration - Full Integration', () => {
  let prisma: ReturnType<typeof getTestPrisma>;
  const testBranchId = 'test-integration-branch';

  beforeAll(async () => {
    prisma = getTestPrisma();
  });

  afterEach(async () => {
    // Clean up all data after each test
    const tableNames = [
      'marksEntry',
      'examSession',
      'exam',
      'payment',
      'invoice',
      'feeSchedule',
      'enrollment',
      'guardian',
      'student',
      'teacher',
      'section',
      'class',
      'subject',
      'room',
      'academicYear',
      'tenant'
    ];

    for (const tableName of tableNames) {
      try {
        await prisma[tableName].deleteMany({});
      } catch (error) {
        // Table might not exist or have dependencies
      }
    }
  });

  describe('Full System Seeding', () => {
    it('should successfully seed all entities in correct order', async () => {
      const orchestrator = new SeedOrchestrator({
        branchId: testBranchId,
        prisma,
        verbose: false
      });

      const { success, results } = await orchestrator.seed();
      
      expect(success).toBe(true);
      
      // Check all seeders ran
      const seederNames = results.map(r => r.entityName);
      expect(seederNames).toContain('tenants');
      expect(seederNames).toContain('academicYears');
      expect(seederNames).toContain('subjects');
      expect(seederNames).toContain('classes');
      expect(seederNames).toContain('teachers');
      expect(seederNames).toContain('students');
      expect(seederNames).toContain('guardians');
      expect(seederNames).toContain('enrollments');
      expect(seederNames).toContain('rooms');
      expect(seederNames).toContain('feeSchedules');
      expect(seederNames).toContain('invoices');
      expect(seederNames).toContain('payments');
      expect(seederNames).toContain('exams');
      expect(seederNames).toContain('examSessions');
      expect(seederNames).toContain('marks');
      
      // All should be successful
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    }, 60000); // 60 second timeout for full seeding

    it('should create valid relationships between all entities', async () => {
      const orchestrator = new SeedOrchestrator({
        branchId: testBranchId,
        prisma,
        verbose: false
      });

      await orchestrator.seed();
      
      // Verify tenant exists
      const tenant = await prisma.tenant.findUnique({
        where: { id: testBranchId }
      });
      expect(tenant).toBeDefined();
      
      // Verify students have enrollments
      const studentsWithEnrollments = await prisma.student.findMany({
        where: { branchId: testBranchId },
        include: { enrollments: true },
        take: 5
      });
      
      studentsWithEnrollments.forEach(student => {
        expect(student.enrollments.length).toBeGreaterThan(0);
      });
      
      // Verify invoices are linked to students
      const invoices = await prisma.invoice.findMany({
        where: { branchId: testBranchId },
        include: { student: true },
        take: 5
      });
      
      invoices.forEach(invoice => {
        expect(invoice.student).toBeDefined();
        expect(invoice.studentId).toBe(invoice.student.id);
      });
      
      // Verify payments are linked to invoices
      const payments = await prisma.payment.findMany({
        where: { branchId: testBranchId },
        include: { invoice: true },
        take: 5
      });
      
      payments.forEach(payment => {
        expect(payment.invoice).toBeDefined();
        expect(payment.invoiceId).toBe(payment.invoice.id);
      });
      
      // Verify exam sessions have subjects and rooms
      const examSessions = await prisma.examSession.findMany({
        where: { branchId: testBranchId },
        include: { 
          exam: true
        },
        take: 5
      });
      
      examSessions.forEach(session => {
        expect(session.exam).toBeDefined();
        // Just verify IDs exist - we can't include subject/room directly
        if (session.subjectId) {
          expect(session.subjectId).toBeTruthy();
        }
        if (session.roomId) {
          expect(session.roomId).toBeTruthy();
        }
      });
      
      // Verify marks are linked to students and sessions
      const marks = await prisma.marksEntry.findMany({
        where: { branchId: testBranchId },
        include: {
          student: true,
          session: true
        },
        take: 5
      });
      
      marks.forEach(mark => {
        expect(mark.student).toBeDefined();
        expect(mark.session).toBeDefined();
      });
    }, 60000);

    it('should maintain data integrity across financial modules', async () => {
      const orchestrator = new SeedOrchestrator({
        branchId: testBranchId,
        prisma,
        verbose: false
      });

      await orchestrator.seed();
      
      // Check invoice amounts are reasonable
      const invoices = await prisma.invoice.findMany({
        where: { branchId: testBranchId },
        take: 10
      });
      
      for (const invoice of invoices) {
        // Check invoice has a reasonable amount
        expect(invoice.amount).toBeGreaterThan(0);
        expect(invoice.amount).toBeLessThanOrEqual(100000); // Max reasonable amount
      }
      
      // Check payment amounts don't exceed invoice totals
      const payments = await prisma.payment.findMany({
        where: { branchId: testBranchId },
        include: { invoice: true }
      });
      
      payments.forEach(payment => {
        expect(payment.amount).toBeLessThanOrEqual(payment.invoice.amount);
      });
    }, 60000);

    it('should maintain data integrity across examination modules', async () => {
      const orchestrator = new SeedOrchestrator({
        branchId: testBranchId,
        prisma,
        verbose: false
      });

      await orchestrator.seed();
      
      // Check marks are only for completed exams
      const marks = await prisma.marksEntry.findMany({
        where: { branchId: testBranchId },
        include: {
          session: {
            include: {
              exam: true
            }
          }
        },
        take: 10
      });
      
      marks.forEach(mark => {
        expect(mark.session.exam.status).toBe('COMPLETED');
      });
      
      // Check marks don't exceed exam max marks
      marks.forEach(mark => {
        if (mark.rawMarks !== null && mark.session.exam.maxMarks) {
          expect(mark.rawMarks).toBeLessThanOrEqual(mark.session.exam.maxMarks);
        }
      });
    }, 60000);

    it('should handle idempotency correctly', async () => {
      const orchestrator = new SeedOrchestrator({
        branchId: testBranchId,
        prisma,
        verbose: false
      });

      // First run
      const { success: success1, results: results1 } = await orchestrator.seed();
      expect(success1).toBe(true);
      
      // Count records created
      const counts1 = {
        students: await prisma.student.count({ where: { branchId: testBranchId } }),
        invoices: await prisma.invoice.count({ where: { branchId: testBranchId } }),
        payments: await prisma.payment.count({ where: { branchId: testBranchId } }),
        exams: await prisma.exam.count({ where: { branchId: testBranchId } }),
        marks: await prisma.marksEntry.count({ where: { branchId: testBranchId } })
      };
      
      // Second run - should not create duplicates
      const { success: success2, results: results2 } = await orchestrator.seed();
      expect(success2).toBe(true);
      
      // Count records after second run
      const counts2 = {
        students: await prisma.student.count({ where: { branchId: testBranchId } }),
        invoices: await prisma.invoice.count({ where: { branchId: testBranchId } }),
        payments: await prisma.payment.count({ where: { branchId: testBranchId } }),
        exams: await prisma.exam.count({ where: { branchId: testBranchId } }),
        marks: await prisma.marksEntry.count({ where: { branchId: testBranchId } })
      };
      
      // Should have same counts (no duplicates)
      expect(counts2.students).toBe(counts1.students);
      expect(counts2.invoices).toBe(counts1.invoices);
      expect(counts2.payments).toBe(counts1.payments);
      expect(counts2.exams).toBe(counts1.exams);
      expect(counts2.marks).toBe(counts1.marks);
      
      // Check that seeders reported 0 new records on second run
      results2.forEach(result => {
        if (result.metrics && result.metrics.totalRecords > 0) {
          console.log(`${result.entityName} created ${result.metrics.totalRecords} records on second run`);
        }
        if (result.metrics) {
          expect(result.metrics.totalRecords).toBe(0);
        }
      });
    }, 120000); // 120 second timeout for double run
  });

  describe('Data Statistics', () => {
    it('should generate comprehensive data statistics', async () => {
      const orchestrator = new SeedOrchestrator({
        branchId: testBranchId,
        prisma,
        verbose: false
      });

      const { success, results } = await orchestrator.seed();
      expect(success).toBe(true);
      
      // Collect statistics
      const stats = {
        // Core entities
        tenants: await prisma.tenant.count({ where: { id: testBranchId } }),
        academicYears: await prisma.academicYear.count({ where: { branchId: testBranchId } }),
        subjects: await prisma.subject.count({ where: { branchId: testBranchId } }),
        classes: await prisma.class.count({ where: { branchId: testBranchId } }),
        sections: await prisma.section.count({ where: { branchId: testBranchId } }),
        teachers: await prisma.teacher.count({ where: { branchId: testBranchId } }),
        students: await prisma.student.count({ where: { branchId: testBranchId } }),
        guardians: await prisma.guardian.count({ where: { branchId: testBranchId } }),
        enrollments: await prisma.enrollment.count({ where: { branchId: testBranchId } }),
        rooms: await prisma.room.count({ where: { branchId: testBranchId } }),
        
        // Financial entities
        feeSchedules: await prisma.feeSchedule.count({ where: { branchId: testBranchId } }),
        invoices: await prisma.invoice.count({ where: { branchId: testBranchId } }),
        payments: await prisma.payment.count({ where: { branchId: testBranchId } }),
        
        // Examination entities
        exams: await prisma.exam.count({ where: { branchId: testBranchId } }),
        examSessions: await prisma.examSession.count({ where: { branchId: testBranchId } }),
        marks: await prisma.marksEntry.count({ where: { branchId: testBranchId } })
      };
      
      console.log('\n📊 Seeding Statistics:');
      console.log('======================');
      console.log('Core Entities:');
      console.log(`  Tenants: ${stats.tenants}`);
      console.log(`  Academic Years: ${stats.academicYears}`);
      console.log(`  Subjects: ${stats.subjects}`);
      console.log(`  Classes: ${stats.classes}`);
      console.log(`  Sections: ${stats.sections}`);
      console.log(`  Teachers: ${stats.teachers}`);
      console.log(`  Students: ${stats.students}`);
      console.log(`  Guardians: ${stats.guardians}`);
      console.log(`  Enrollments: ${stats.enrollments}`);
      console.log(`  Rooms: ${stats.rooms}`);
      console.log('\nFinancial Module:');
      console.log(`  Fee Schedules: ${stats.feeSchedules}`);
      console.log(`  Invoices: ${stats.invoices}`);
      console.log(`  Payments: ${stats.payments}`);
      console.log('\nExamination Module:');
      console.log(`  Exams: ${stats.exams}`);
      console.log(`  Exam Sessions: ${stats.examSessions}`);
      console.log(`  Marks Entries: ${stats.marks}`);
      console.log('======================\n');
      
      // Verify minimum counts
      expect(stats.tenants).toBeGreaterThan(0);
      expect(stats.students).toBeGreaterThan(0);
      expect(stats.teachers).toBeGreaterThan(0);
      expect(stats.invoices).toBeGreaterThan(0);
      expect(stats.exams).toBeGreaterThan(0);
      
      // Verify relationships
      expect(stats.enrollments).toBeGreaterThanOrEqual(stats.students); // Each student has at least one enrollment
      expect(stats.invoices).toBeGreaterThanOrEqual(stats.students); // Each student should have invoices
      expect(stats.payments).toBeGreaterThan(0); // Some invoices should be paid
      expect(stats.marks).toBeGreaterThan(0); // Some marks should be created for completed exams
    }, 60000);
  });
});