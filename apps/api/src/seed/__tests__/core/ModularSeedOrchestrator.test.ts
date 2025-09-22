/**
 * Tests for ModularSeedOrchestrator - Main orchestration engine
 * Following TDD methodology - tests first, implementation second
 */

import { ModularSeedOrchestrator } from '../../core/ModularSeedOrchestrator';
import { BaseSeeder } from '../../core/BaseSeeder';
import { AcademicYearSeeder } from '../../entities/AcademicYearSeeder';
import { SeedContext, SeedOptions, SeederRegistry, SeedResult } from '../../core/interfaces';
import { createTestSeedContext, TestLogger, assertEntitiesExist } from '../test-helpers';
import { getTestPrisma } from '../setup';
import '../setup'; // Import setup to ensure lifecycle hooks run

describe('ModularSeedOrchestrator', () => {
  let orchestrator: ModularSeedOrchestrator;
  let context: SeedContext;
  let testLogger: TestLogger;

  beforeEach(() => {
    testLogger = new TestLogger();
    context = createTestSeedContext('test-dps-main');
    context.logger = testLogger;
    orchestrator = new ModularSeedOrchestrator();
  });

  describe('Initialization', () => {
    it('should initialize with empty seeder registry', () => {
      expect(orchestrator.getRegisteredSeeders()).toHaveLength(0);
    });

    it('should accept initial options', () => {
      const options: Partial<SeedOptions> = {
        batchSize: 200,
        parallel: true,
        verbose: true
      };
      
      const customOrchestrator = new ModularSeedOrchestrator(options);
      expect(customOrchestrator).toBeDefined();
    });
  });

  describe('Seeder Registration', () => {
    it('should register a single seeder', () => {
      const academicYearSeeder = new AcademicYearSeeder();
      
      orchestrator.registerSeeder(academicYearSeeder);
      
      const registered = orchestrator.getRegisteredSeeders();
      expect(registered).toHaveLength(1);
      expect(registered[0].entityName).toBe('academicYears');
    });

    it('should register multiple seeders', () => {
      const seeder1 = new AcademicYearSeeder();
      
      orchestrator.registerSeeders([seeder1]);
      
      expect(orchestrator.getRegisteredSeeders()).toHaveLength(1);
    });

    it('should prevent duplicate seeder registration', () => {
      const seeder1 = new AcademicYearSeeder();
      const seeder2 = new AcademicYearSeeder();
      
      orchestrator.registerSeeder(seeder1);
      
      expect(() => orchestrator.registerSeeder(seeder2))
        .toThrow('Seeder for entity academicYears is already registered');
    });

    it('should allow overriding seeder registration', () => {
      const seeder1 = new AcademicYearSeeder();
      const seeder2 = new AcademicYearSeeder();
      
      orchestrator.registerSeeder(seeder1);
      orchestrator.registerSeeder(seeder2, { override: true });
      
      expect(orchestrator.getRegisteredSeeders()).toHaveLength(1);
    });
  });

  describe('Dependency Resolution', () => {
    it('should resolve simple dependency order', () => {
      const academicYearSeeder = new AcademicYearSeeder();
      
      orchestrator.registerSeeder(academicYearSeeder);
      
      const ordered = orchestrator.getExecutionOrder();
      expect(ordered).toHaveLength(1);
      expect(ordered[0].entityName).toBe('academicYears');
    });

    it('should handle empty dependencies', () => {
      const academicYearSeeder = new AcademicYearSeeder();
      
      orchestrator.registerSeeder(academicYearSeeder);
      
      const ordered = orchestrator.getExecutionOrder();
      expect(ordered[0].dependencies).toEqual([]);
    });

    it('should detect circular dependencies', () => {
      class CircularSeeder1 extends BaseSeeder {
        readonly entityName = 'circular1';
        readonly dependencies = ['circular2'];
      }
      
      class CircularSeeder2 extends BaseSeeder {
        readonly entityName = 'circular2';
        readonly dependencies = ['circular1'];
      }
      
      const seeder1 = new CircularSeeder1();
      const seeder2 = new CircularSeeder2();
      
      orchestrator.registerSeeders([seeder1, seeder2]);
      
      expect(() => orchestrator.getExecutionOrder())
        .toThrow('Circular dependency detected');
    });

    it('should resolve dependencies for missing seeders', () => {
      class DependentSeeder extends BaseSeeder {
        readonly entityName = 'dependent';
        readonly dependencies = ['nonExistent'];
      }
      
      const seeder = new DependentSeeder();
      orchestrator.registerSeeder(seeder);
      
      expect(() => orchestrator.getExecutionOrder())
        .toThrow('Dependency nonExistent not found for seeder dependent');
    });
  });

  describe('Context Management', () => {
    it('should create proper seed context', () => {
      const options: SeedOptions = {
        batchSize: 100,
        skipValidation: false,
        dryRun: false,
        verbose: true,
        parallel: false,
        maxRetries: 3
      };
      
      const seedContext = orchestrator.createSeedContext('test-branch', options);
      
      expect(seedContext.branchId).toBe('test-branch');
      expect(seedContext.options).toEqual(options);
      expect(seedContext.createdEntities).toBeInstanceOf(Map);
      expect(seedContext.logger).toBeDefined();
    });

    it('should merge options with defaults', () => {
      const orchestratorWithDefaults = new ModularSeedOrchestrator({
        batchSize: 200,
        verbose: true
      });
      
      const seedContext = orchestratorWithDefaults.createSeedContext('test-branch', {
        skipValidation: true
      });
      
      expect(seedContext.options.batchSize).toBe(200); // From orchestrator default
      expect(seedContext.options.verbose).toBe(true); // From orchestrator default
      expect(seedContext.options.skipValidation).toBe(true); // From parameter
    });
  });

  describe('Seeding Execution', () => {
    it('should execute single seeder successfully', async () => {
      const academicYearSeeder = new AcademicYearSeeder();
      orchestrator.registerSeeder(academicYearSeeder);
      
      const result = await orchestrator.seedBranch('test-dps-main', context.options, context);
      
      expect(result.success).toBe(true);
      expect(result.totalSeeded).toBeGreaterThan(0);
      expect(result.entityResults).toHaveProperty('academicYears');
      expect(result.entityResults.academicYears.success).toBe(true);
      expect(result.entityResults.academicYears.metrics.totalRecords).toBe(5);
    });

    it('should track execution progress', async () => {
      const academicYearSeeder = new AcademicYearSeeder();
      orchestrator.registerSeeder(academicYearSeeder);
      
      const result = await orchestrator.seedBranch('test-dps-main', context.options, context);
      
      expect(result.success).toBe(true);
      expect(result.metrics.startTime).toBeInstanceOf(Date);
      expect(result.metrics.endTime).toBeInstanceOf(Date);
      expect(result.metrics.duration).toBeGreaterThan(0);
    });

    it('should handle seeder failures gracefully', async () => {
      class FailingSeeder extends BaseSeeder {
        readonly entityName = 'failing';
        
        async seed(): Promise<any> {
          throw new Error('Intentional test failure');
        }
      }
      
      const failingSeeder = new FailingSeeder();
      orchestrator.registerSeeder(failingSeeder);
      
      const result = await orchestrator.seedBranch('test-dps-main', context.options, context);
      
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Intentional test failure');
    });

    it('should continue execution when skipValidation is enabled', async () => {
      class FailingSeeder extends BaseSeeder {
        readonly entityName = 'failing';
        
        async seed(): Promise<any> {
          throw new Error('Intentional test failure');
        }
      }
      
      const academicYearSeeder = new AcademicYearSeeder();
      const failingSeeder = new FailingSeeder();
      
      orchestrator.registerSeeders([academicYearSeeder, failingSeeder]);
      
      const result = await orchestrator.seedBranch('test-dps-main', {
        ...context.options,
        skipValidation: true
      });
      
      expect(result.success).toBe(true); // Should be true due to skipValidation
      expect(result.errors.length).toBeGreaterThan(0); // But still have errors
      expect(result.entityResults.academicYears.success).toBe(true); // Academic years should succeed
    });
  });

  describe('Validation', () => {
    it('should validate all seeders after execution', async () => {
      const academicYearSeeder = new AcademicYearSeeder();
      orchestrator.registerSeeder(academicYearSeeder);
      
      await orchestrator.seedBranch('test-dps-main', context.options);
      
      const validation = await orchestrator.validateBranch('test-dps-main', context);
      
      expect(validation.success).toBe(true);
      expect(validation.entityValidations).toHaveProperty('academicYears');
      expect(validation.entityValidations.academicYears).toBe(true);
    });

    it('should detect validation failures', async () => {
      class AlwaysFailsValidationSeeder extends BaseSeeder {
        readonly entityName = 'alwaysFails';
        
        async validate(): Promise<boolean> {
          return false;
        }
      }
      
      const failingSeeder = new AlwaysFailsValidationSeeder();
      orchestrator.registerSeeder(failingSeeder);
      
      await orchestrator.seedBranch('test-dps-main', context.options);
      
      const validation = await orchestrator.validateBranch('test-dps-main', context);
      
      expect(validation.success).toBe(false);
      expect(validation.entityValidations.alwaysFails).toBe(false);
    });
  });

  describe('Progress Reporting', () => {
    it('should report overall progress during seeding', async () => {
      const academicYearSeeder = new AcademicYearSeeder();
      orchestrator.registerSeeder(academicYearSeeder);
      
      const result = await orchestrator.seedBranch('test-dps-main', {
        ...context.options,
        verbose: true
      }, context);
      
      expect(result.success).toBe(true);
      
      const infoLogs = testLogger.getLogsByLevel('info');
      expect(infoLogs.some(log => log.message.includes('Starting seed operation'))).toBe(true);
      expect(infoLogs.some(log => log.message.includes('Seed operation completed'))).toBe(true);
    });

    it('should track progress for each seeder', async () => {
      const academicYearSeeder = new AcademicYearSeeder();
      orchestrator.registerSeeder(academicYearSeeder);
      
      await orchestrator.seedBranch('test-dps-main', context.options, context);
      
      const progressLogs = testLogger.getProgressLogs();
      expect(progressLogs.length).toBeGreaterThan(0);
      
      const orchestratorProgress = progressLogs.filter(p => p.entityName === 'overall');
      expect(orchestratorProgress.length).toBeGreaterThan(0);
    });
  });

  describe('Dry Run Mode', () => {
    it('should simulate seeding without actual database changes', async () => {
      const academicYearSeeder = new AcademicYearSeeder();
      orchestrator.registerSeeder(academicYearSeeder);
      
      const result = await orchestrator.seedBranch('test-dps-main', {
        ...context.options,
        dryRun: true
      });
      
      expect(result.success).toBe(true);
      expect(result.totalSeeded).toBe(0); // No actual records created in dry run
      
      // Verify no records were actually created
      const prisma = getTestPrisma();
      const academicYearCount = await prisma.academicYear.count({
        where: { branchId: 'test-dps-main' }
      });
      expect(academicYearCount).toBe(0);
    });
  });

  describe('Multi-branch Operations', () => {
    it('should seed multiple branches with proper isolation', async () => {
      const academicYearSeeder = new AcademicYearSeeder();
      orchestrator.registerSeeder(academicYearSeeder);
      
      // Seed each branch separately - let orchestrator create contexts for proper branchId isolation
      const dpsResult = await orchestrator.seedBranch('test-dps-main', context.options);
      const kvsResult = await orchestrator.seedBranch('test-kvs-central', context.options);
      
      expect(dpsResult.success).toBe(true);
      expect(dpsResult.totalSeeded).toBeGreaterThan(0);
      expect(kvsResult.success).toBe(true);
      expect(kvsResult.totalSeeded).toBeGreaterThan(0);
      
      // Debug: Check result metrics
      console.log('DPS Result:', dpsResult.entityResults.academicYears?.metrics);
      console.log('KVS Result:', kvsResult.entityResults.academicYears?.metrics);
      
      // Verify data isolation
      const prisma = getTestPrisma();
      
      // Debug: Check all records
      const allRecords = await prisma.academicYear.findMany();
      console.log('All records in database:', allRecords.map(r => ({ id: r.id, branchId: r.branchId, name: r.name })));
      
      const dpsRecords = await prisma.academicYear.count({ where: { branchId: 'test-dps-main' } });
      const kvsRecords = await prisma.academicYear.count({ where: { branchId: 'test-kvs-central' } });
      
      console.log('DPS count:', dpsRecords);
      console.log('KVS count:', kvsRecords);
      
      expect(dpsRecords).toBe(5);
      expect(kvsRecords).toBe(5);
    });

    it('should handle partial failures in multi-branch seeding', async () => {
      class ConditionalFailSeeder extends AcademicYearSeeder {
        async seed(context: SeedContext): Promise<any> {
          if (context.branchId === 'test-kvs-central') {
            throw new Error('KVS branch failure');
          }
          return super.seed(context);
        }
      }
      
      const seeder = new ConditionalFailSeeder();
      orchestrator.registerSeeder(seeder);
      
      const branches = ['test-dps-main', 'test-kvs-central'];
      const results = await orchestrator.seedMultipleBranches(branches, context.options);
      
      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true); // DPS should succeed
      expect(results[1].success).toBe(false); // KVS should fail
    });
  });

  describe('Cleanup Operations', () => {
    it('should perform cleanup after seeding', async () => {
      const academicYearSeeder = new AcademicYearSeeder();
      orchestrator.registerSeeder(academicYearSeeder);
      
      await orchestrator.seedBranch('test-dps-main', context.options);
      
      await expect(orchestrator.cleanup('test-dps-main', context)).resolves.not.toThrow();
      
      const debugLogs = testLogger.getLogsByLevel('debug');
      expect(debugLogs.some(log => log.message.includes('Cleanup completed'))).toBe(true);
    });
  });

  describe('Error Recovery', () => {
    it('should retry failed operations when maxRetries is set', async () => {
      let attemptCount = 0;
      
      class RetrySeeder extends AcademicYearSeeder {
        async seed(): Promise<any> {
          attemptCount++;
          if (attemptCount < 3) {
            throw new Error('Retry test failure');
          }
          return super.seed(arguments[0]);
        }
      }
      
      const seeder = new RetrySeeder();
      orchestrator.registerSeeder(seeder);
      
      const result = await orchestrator.seedBranch('test-dps-main', {
        ...context.options,
        maxRetries: 3
      });
      
      expect(result.success).toBe(true);
      expect(attemptCount).toBe(3); // Should have tried 3 times
    });
  });

  describe('Performance Monitoring', () => {
    it('should track memory usage and execution metrics', async () => {
      const academicYearSeeder = new AcademicYearSeeder();
      orchestrator.registerSeeder(academicYearSeeder);
      
      const result = await orchestrator.seedBranch('test-dps-main', context.options, context);
      
      expect(result.metrics).toBeDefined();
      expect(result.metrics.startTime).toBeInstanceOf(Date);
      expect(result.metrics.endTime).toBeInstanceOf(Date);
      expect(result.metrics.duration).toBeGreaterThan(0);
      expect(result.metrics.memoryUsage).toBeDefined();
    });
  });
});