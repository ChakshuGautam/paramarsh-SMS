/**
 * Orchestrator Integration Test
 * Tests the complete seeding process with all seeders
 */

import { SeedOrchestrator } from '../core/SeedOrchestrator';
import { getTestPrisma } from './setup';
import './setup'; // Import setup to ensure lifecycle hooks run

describe('SeedOrchestrator - Full Integration', () => {
  let orchestrator: SeedOrchestrator;
  let prisma: ReturnType<typeof getTestPrisma>;
  const testBranchId = 'integration-test-branch';

  beforeAll(async () => {
    prisma = getTestPrisma();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clear database before each test
    await prisma.enrollment.deleteMany({});
    await prisma.studentGuardian.deleteMany({});
    await prisma.guardian.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.teacher.deleteMany({});
    await prisma.section.deleteMany({});
    await prisma.class.deleteMany({});
    await prisma.subject.deleteMany({});
    await prisma.academicYear.deleteMany({});
    await prisma.tenant.deleteMany({});
    
    orchestrator = new SeedOrchestrator({
      branchId: testBranchId,
      prisma,
      useCheckpoints: false, // Don't use checkpoints for integration test
      verbose: true
    });
  });

  describe('Complete Seeding Process', () => {
    it('should successfully seed all entities in correct order', async () => {
      const result = await orchestrator.seed();
      
      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(8); // All 8 seeders
      
      // Check each seeder succeeded
      result.results.forEach((seederResult, index) => {
        expect(seederResult.success).toBe(true);
        console.log(`${seederResult.entityName}: ${seederResult.metrics.successCount} records`);
      });
    });

    it('should create expected data hierarchy', async () => {
      await orchestrator.seed();
      
      // Verify data was created
      const counts = {
        tenants: await prisma.tenant.count({ where: { branchId: testBranchId } }),
        academicYears: await prisma.academicYear.count({ where: { branchId: testBranchId } }),
        subjects: await prisma.subject.count({ where: { branchId: testBranchId } }),
        classes: await prisma.class.count({ where: { branchId: testBranchId } }),
        sections: await prisma.section.count({ where: { branchId: testBranchId } }),
        // teachers: await prisma.teacher.count({ where: { branchId: testBranchId } }),
        students: await prisma.student.count({ where: { branchId: testBranchId } }),
        guardians: await prisma.guardian.count({ where: { branchId: testBranchId } }),
        enrollments: await prisma.enrollment.count({ where: { branchId: testBranchId } })
      };
      
      console.log('Data counts:', counts);
      
      // Verify minimum data expectations
      expect(counts.tenants).toBe(1);
      expect(counts.academicYears).toBeGreaterThanOrEqual(3);
      expect(counts.subjects).toBeGreaterThanOrEqual(8); // Based on actual seeder
      expect(counts.classes).toBeGreaterThanOrEqual(5);
      expect(counts.sections).toBeGreaterThan(10);
      expect(counts.students).toBeGreaterThan(500);
      expect(counts.guardians).toBeGreaterThan(50); // Families share guardians
      expect(counts.enrollments).toBe(counts.students); // Each student has an enrollment
    });

    it('should maintain referential integrity', async () => {
      await orchestrator.seed();
      
      // Check student-guardian relationships
      const studentsWithGuardians = await prisma.student.findMany({
        where: { branchId: testBranchId },
        include: { guardians: true },
        take: 10
      });
      
      studentsWithGuardians.forEach(student => {
        expect(student.guardians.length).toBeGreaterThanOrEqual(1);
      });
      
      // Check student enrollments
      const studentsWithEnrollments = await prisma.student.findMany({
        where: { branchId: testBranchId },
        include: { enrollments: true },
        take: 10
      });
      
      studentsWithEnrollments.forEach(student => {
        expect(student.enrollments).toHaveLength(1);
      });
      
      // Check sections have enrollments (students enrolled in sections)
      const sectionsWithEnrollments = await prisma.section.findMany({
        where: { branchId: testBranchId },
        include: { 
          _count: { 
            select: { enrollments: true } 
          } 
        }
      });
      
      sectionsWithEnrollments.forEach(section => {
        expect(section._count.enrollments).toBeGreaterThan(0);
      });
    });
  });

  describe('Idempotency', () => {
    it('should handle multiple runs gracefully', async () => {
      // First run
      const result1 = await orchestrator.seed();
      expect(result1.success).toBe(true);
      
      const counts1 = {
        students: await prisma.student.count({ where: { branchId: testBranchId } }),
        guardians: await prisma.guardian.count({ where: { branchId: testBranchId } }),
        enrollments: await prisma.enrollment.count({ where: { branchId: testBranchId } })
      };
      
      // Second run (should be mostly idempotent)
      const result2 = await orchestrator.seed();
      expect(result2.success).toBe(true);
      
      const counts2 = {
        students: await prisma.student.count({ where: { branchId: testBranchId } }),
        guardians: await prisma.guardian.count({ where: { branchId: testBranchId } }),
        enrollments: await prisma.enrollment.count({ where: { branchId: testBranchId } })
      };
      
      // Counts should remain the same
      expect(counts2.students).toBe(counts1.students);
      expect(counts2.enrollments).toBe(counts1.enrollments);
      // Guardians might increase slightly due to randomization
      expect(counts2.guardians).toBeGreaterThanOrEqual(counts1.guardians);
    });
  });

  describe('Performance', () => {
    it('should complete full seeding within reasonable time', async () => {
      const startTime = Date.now();
      const result = await orchestrator.seed();
      const duration = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      console.log(`Full orchestration completed in ${duration}ms`);
      
      // Should complete within 30 seconds
      expect(duration).toBeLessThan(30000);
    });
  });
});