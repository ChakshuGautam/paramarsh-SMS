/**
 * Tests for core interfaces - ensuring TypeScript contracts are correct
 */

import { 
  SeedMetrics, 
  SeedProgress, 
  SeedOptions, 
  SeedResult, 
  SeedContext,
  ISeedEntity,
  ISeedOrchestrator,
  BranchConfig,
  MultiBranchConfig,
  EntityType
} from '../../core/interfaces';
import '../setup'; // Import setup to ensure lifecycle hooks run

describe('Core Interfaces', () => {
  describe('SeedMetrics', () => {
    it('should enforce required properties', () => {
      const metrics: SeedMetrics = {
        totalRecords: 100,
        successCount: 95,
        errorCount: 5,
        startTime: new Date()
      };
      
      expect(metrics.totalRecords).toBe(100);
      expect(metrics.successCount).toBe(95);
      expect(metrics.errorCount).toBe(5);
      expect(metrics.startTime).toBeInstanceOf(Date);
    });

    it('should allow optional properties', () => {
      const metrics: SeedMetrics = {
        totalRecords: 100,
        successCount: 95,
        errorCount: 5,
        startTime: new Date(),
        endTime: new Date(),
        duration: 5000,
        memoryUsage: process.memoryUsage()
      };
      
      expect(metrics.endTime).toBeInstanceOf(Date);
      expect(metrics.duration).toBe(5000);
      expect(metrics.memoryUsage).toBeDefined();
    });
  });

  describe('SeedProgress', () => {
    it('should enforce progress tracking structure', () => {
      const progress: SeedProgress = {
        entityName: 'students',
        stage: 'seeding',
        processed: 50,
        total: 100,
        percentage: 50
      };
      
      expect(progress.entityName).toBe('students');
      expect(progress.stage).toBe('seeding');
      expect(progress.processed).toBe(50);
      expect(progress.total).toBe(100);
      expect(progress.percentage).toBe(50);
    });

    it('should enforce valid stage values', () => {
      const validStages: SeedProgress['stage'][] = [
        'preparing', 'seeding', 'validating', 'completed', 'error'
      ];
      
      validStages.forEach(stage => {
        const progress: SeedProgress = {
          entityName: 'test',
          stage,
          processed: 0,
          total: 100,
          percentage: 0
        };
        expect(progress.stage).toBe(stage);
      });
    });
  });

  describe('SeedOptions', () => {
    it('should have sensible defaults when properties are optional', () => {
      const options: SeedOptions = {};
      
      // TypeScript should allow empty options object
      expect(options).toBeDefined();
    });

    it('should accept all configuration options', () => {
      const options: SeedOptions = {
        batchSize: 500,
        skipValidation: true,
        dryRun: false,
        verbose: true,
        parallel: true,
        maxRetries: 3,
        branchId: 'test-branch',
        schoolId: 'test-school'
      };
      
      expect(options.batchSize).toBe(500);
      expect(options.skipValidation).toBe(true);
      expect(options.dryRun).toBe(false);
      expect(options.verbose).toBe(true);
      expect(options.parallel).toBe(true);
      expect(options.maxRetries).toBe(3);
      expect(options.branchId).toBe('test-branch');
      expect(options.schoolId).toBe('test-school');
    });
  });

  describe('SeedResult', () => {
    it('should enforce result structure', () => {
      const result: SeedResult = {
        entityName: 'students',
        success: true,
        metrics: {
          totalRecords: 100,
          successCount: 100,
          errorCount: 0,
          startTime: new Date()
        },
        errors: [],
        warnings: []
      };
      
      expect(result.entityName).toBe('students');
      expect(result.success).toBe(true);
      expect(result.metrics.totalRecords).toBe(100);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });
  });

  describe('BranchConfig', () => {
    it('should enforce branch configuration structure', () => {
      const config: BranchConfig = {
        branchId: 'test-dps-main',
        schoolId: 'dps',
        displayName: 'Test DPS Main Campus',
        settings: {
          studentCount: 100,
          teacherCount: 10,
          classCount: 5
        }
      };
      
      expect(config.branchId).toBe('test-dps-main');
      expect(config.schoolId).toBe('dps');
      expect(config.displayName).toBe('Test DPS Main Campus');
      expect(config.settings.studentCount).toBe(100);
    });

    it('should allow customizations in settings', () => {
      const config: BranchConfig = {
        branchId: 'test-branch',
        schoolId: 'test',
        displayName: 'Test Branch',
        settings: {
          studentCount: 100,
          teacherCount: 10,
          classCount: 5,
          customizations: {
            useSpecialCurriculum: true,
            extraSubjects: ['Music', 'Art']
          }
        }
      };
      
      expect(config.settings.customizations?.useSpecialCurriculum).toBe(true);
      expect(config.settings.customizations?.extraSubjects).toContain('Music');
    });
  });

  describe('MultiBranchConfig', () => {
    it('should enforce multi-branch configuration structure', () => {
      const config: MultiBranchConfig = {
        branches: [
          {
            branchId: 'test-dps-main',
            schoolId: 'dps',
            displayName: 'Test DPS Main',
            settings: { studentCount: 100, teacherCount: 10, classCount: 5 }
          }
        ],
        globalSettings: {
          startAcademicYear: 2024,
          dataGenerationSeed: 12345,
          parallelExecution: true,
          batchSize: 1000
        }
      };
      
      expect(config.branches).toHaveLength(1);
      expect(config.globalSettings.startAcademicYear).toBe(2024);
      expect(config.globalSettings.parallelExecution).toBe(true);
    });
  });

  describe('EntityType', () => {
    it('should include all expected entity types', () => {
      const entityTypes: EntityType[] = [
        'academicYears', 'branches', 'subjects', 'classes', 'sections',
        'teachers', 'students', 'guardians', 'enrollments',
        'rooms', 'timeSlots', 'timetables',
        'attendanceRecords', 'teacherAttendance',
        'exams', 'marks',
        'feeStructures', 'invoices', 'payments',
        'admissionsApplications',
        'campaigns', 'messages', 'templates', 'tickets'
      ];
      
      // TypeScript should accept all these values
      entityTypes.forEach(entityType => {
        expect(typeof entityType).toBe('string');
      });
      
      expect(entityTypes).toContain('academicYears');
      expect(entityTypes).toContain('students');
      expect(entityTypes).toContain('teachers');
    });
  });
});

describe('Interface Contracts', () => {
  describe('ISeedEntity', () => {
    it('should enforce the contract for seed entities', () => {
      class MockSeeder implements ISeedEntity {
        readonly entityName = 'mock';
        readonly dependencies = ['academicYears'];
        readonly batchSize = 100;
        
        async seed(): Promise<SeedResult> {
          return {
            entityName: this.entityName,
            success: true,
            metrics: {
              totalRecords: 0,
              successCount: 0,
              errorCount: 0,
              startTime: new Date()
            },
            errors: [],
            warnings: []
          };
        }
        
        async validate(): Promise<boolean> {
          return true;
        }
        
        async cleanup(): Promise<void> {
          // No-op
        }
        
        getDependencies(): string[] {
          return [...this.dependencies];
        }
        
        estimateRecordCount(): number {
          return 100;
        }
      }
      
      const seeder = new MockSeeder();
      expect(seeder.entityName).toBe('mock');
      expect(seeder.dependencies).toContain('academicYears');
      expect(seeder.batchSize).toBe(100);
    });
  });

  describe('ISeedOrchestrator', () => {
    it('should enforce the contract for orchestrators', () => {
      class MockOrchestrator implements ISeedOrchestrator {
        async execute(): Promise<SeedResult[]> {
          return [];
        }
        
        async validateDependencies(): Promise<boolean> {
          return true;
        }
        
        getExecutionPlan(): string[] {
          return ['academicYears', 'students'];
        }
        
        async cleanup(): Promise<void> {
          // No-op
        }
      }
      
      const orchestrator = new MockOrchestrator();
      expect(orchestrator.getExecutionPlan()).toContain('academicYears');
    });
  });
});