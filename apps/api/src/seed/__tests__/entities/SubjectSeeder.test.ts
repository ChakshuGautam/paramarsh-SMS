/**
 * Tests for SubjectSeeder Entity
 * Following TDD methodology - tests first, then implementation
 */

import { SubjectSeeder } from '../../entities/SubjectSeeder';
import { SeedContext } from '../../core/interfaces';
import { createTestSeedContext, assertEntitiesExist } from '../test-helpers';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run

describe('SubjectSeeder', () => {
  let seeder: SubjectSeeder;
  let context: SeedContext;

  beforeEach(async () => {
    seeder = new SubjectSeeder();
    context = createTestSeedContext('test-dps-main');
  });

  afterEach(async () => {
    // Clean up test data
    await getTestPrisma().subject.deleteMany({
      where: { branchId: context.branchId }
    });
  });

  describe('Entity Configuration', () => {
    it('should have correct entity name', () => {
      expect(seeder.entityName).toBe('subjects');
    });

    it('should have correct dependencies', () => {
      expect(seeder.dependencies).toEqual(['academicYears']);
    });

    it('should have correct priority', () => {
      expect(seeder.priority).toBe(10);
    });
  });

  describe('Data Generation', () => {
    it('should generate subjects for all grades', async () => {
      // First seed academic years as dependency
      const academicYear = await getTestPrisma().academicYear.create({
        data: {
          id: `${context.branchId}-ay-2024-25`,
          branchId: context.branchId,
          name: '2024-25',
          startDate: '2024-04-01',
          endDate: '2025-03-31',
          isActive: true
        }
      });

      context.createdEntities.set('academicYears', [academicYear]);

      const result = await seeder.seed(context);

      expect(result.success).toBe(true);
      expect(result.metrics.totalRecords).toBeGreaterThan(0);
      expect(result.entityName).toBe('subjects');

      // Verify subjects exist in database
      const subjects = await getTestPrisma().subject.findMany({
        where: { branchId: context.branchId }
      });

      expect(subjects.length).toBeGreaterThan(0);
      
      // Verify we have a good variety of subjects
      const subjectNames = [...new Set(subjects.map(s => s.name))];
      expect(subjectNames.length).toBeGreaterThanOrEqual(8); // At least 8 different subjects
    });

    it('should generate appropriate variety of subjects', async () => {
      const academicYear = await getTestPrisma().academicYear.create({
        data: {
          id: `${context.branchId}-ay-2024-25`,
          branchId: context.branchId,
          name: '2024-25',
          startDate: '2024-04-01',
          endDate: '2025-03-31',
          isActive: true
        }
      });

      context.createdEntities.set('academicYears', [academicYear]);

      const result = await seeder.seed(context);

      const subjects = await getTestPrisma().subject.findMany({
        where: { branchId: context.branchId }
      });

      const subjectNames = subjects.map(s => s.name);
      
      // Should have basic subjects
      expect(subjectNames).toEqual(
        expect.arrayContaining(['Mathematics', 'English', 'Hindi'])
      );

      // Should have science subjects  
      const hasScienceSubjects = subjectNames.some(name => 
        ['Science', 'Physics', 'Chemistry', 'Biology'].includes(name)
      );
      expect(hasScienceSubjects).toBe(true);

      // Should have social science/humanities
      const hasSocialSubjects = subjectNames.some(name =>
        ['Social Studies', 'History', 'Geography', 'Economics', 'Civics'].includes(name)
      );
      expect(hasSocialSubjects).toBe(true);
    });

    it('should assign unique codes to subjects', async () => {
      const academicYear = await getTestPrisma().academicYear.create({
        data: {
          id: `${context.branchId}-ay-2024-25`,
          branchId: context.branchId,
          name: '2024-25',
          startDate: '2024-04-01',
          endDate: '2025-03-31',
          isActive: true
        }
      });

      context.createdEntities.set('academicYears', [academicYear]);

      const result = await seeder.seed(context);

      const subjects = await getTestPrisma().subject.findMany({
        where: { branchId: context.branchId }
      });

      // Check all subjects have codes
      subjects.forEach(subject => {
        expect(subject.code).toBeTruthy();
        expect(subject.code.length).toBeGreaterThan(3); // Should have meaningful code
      });

      // Check codes are unique within branch
      const codes = subjects.map(s => s.code);
      const uniqueCodes = [...new Set(codes)];
      expect(codes.length).toBe(uniqueCodes.length);
    });

    it('should set proper credits for subjects', async () => {
      const academicYear = await getTestPrisma().academicYear.create({
        data: {
          id: `${context.branchId}-ay-2024-25`,
          branchId: context.branchId,
          name: '2024-25',
          startDate: '2024-04-01',
          endDate: '2025-03-31',
          isActive: true
        }
      });

      context.createdEntities.set('academicYears', [academicYear]);

      const result = await seeder.seed(context);

      const subjects = await getTestPrisma().subject.findMany({
        where: { branchId: context.branchId }
      });

      subjects.forEach(subject => {
        expect(subject.credits).toBeGreaterThanOrEqual(1);
        expect(subject.credits).toBeLessThanOrEqual(5);
        
        // Core subjects should have more credits
        if (['Mathematics', 'Physics', 'Chemistry', 'Biology'].includes(subject.name)) {
          expect(subject.credits).toBeGreaterThanOrEqual(3);
        }
      });
    });
  });

  describe('Multi-branch Isolation', () => {
    it('should create subjects only for specified branch', async () => {
      const academicYear = await getTestPrisma().academicYear.create({
        data: {
          id: `${context.branchId}-ay-2024-25`,
          branchId: context.branchId,
          name: '2024-25',
          startDate: '2024-04-01',
          endDate: '2025-03-31',
          isActive: true
        }
      });

      context.createdEntities.set('academicYears', [academicYear]);

      const result = await seeder.seed(context);

      const dpSubjects = await getTestPrisma().subject.findMany({
        where: { branchId: 'test-dps-main' }
      });

      const otherSubjects = await getTestPrisma().subject.findMany({
        where: { branchId: { not: 'test-dps-main' } }
      });

      expect(dpSubjects.length).toBeGreaterThan(0);
      expect(otherSubjects.length).toBe(0);
    });
  });

  describe('Validation', () => {
    it('should validate successfully when subjects exist', async () => {
      const academicYear = await getTestPrisma().academicYear.create({
        data: {
          id: `${context.branchId}-ay-2024-25`,
          branchId: context.branchId,
          name: '2024-25',
          startDate: '2024-04-01',
          endDate: '2025-03-31',
          isActive: true
        }
      });

      context.createdEntities.set('academicYears', [academicYear]);

      await seeder.seed(context);
      
      const isValid = await seeder.validate(context);
      expect(isValid).toBe(true);
    });

    it('should fail validation when no subjects exist', async () => {
      const isValid = await seeder.validate(context);
      expect(isValid).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup seeded subjects', async () => {
      const academicYear = await getTestPrisma().academicYear.create({
        data: {
          id: `${context.branchId}-ay-2024-25`,
          branchId: context.branchId,
          name: '2024-25',
          startDate: '2024-04-01',
          endDate: '2025-03-31',
          isActive: true
        }
      });

      context.createdEntities.set('academicYears', [academicYear]);

      await seeder.seed(context);
      
      const subjectsBefore = await getTestPrisma().subject.count({
        where: { branchId: context.branchId }
      });
      expect(subjectsBefore).toBeGreaterThan(0);

      await seeder.cleanup(context);

      const subjectsAfter = await getTestPrisma().subject.count({
        where: { branchId: context.branchId }
      });
      expect(subjectsAfter).toBe(0);
    });
  });

  describe('Progress Tracking', () => {
    it('should track progress during seeding', async () => {
      const academicYear = await getTestPrisma().academicYear.create({
        data: {
          id: `${context.branchId}-ay-2024-25`,
          branchId: context.branchId,
          name: '2024-25',
          startDate: '2024-04-01',
          endDate: '2025-03-31',
          isActive: true
        }
      });

      context.createdEntities.set('academicYears', [academicYear]);

      const progressUpdates: any[] = [];
      context.logger.progress = jest.fn((update) => {
        progressUpdates.push(update);
      });

      await seeder.seed(context);

      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates.some(u => u.entityName === 'subjects')).toBe(true);
      expect(progressUpdates.some(u => u.stage === 'completed')).toBe(true);
    });
  });
});