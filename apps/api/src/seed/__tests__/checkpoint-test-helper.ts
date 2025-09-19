/**
 * Checkpoint Test Helper
 * Provides utilities for fast TDD using database checkpoints
 */

import { PrismaClient } from '@prisma/client';
import { SeedOrchestrator } from '../core/SeedOrchestrator';
import { TestCheckpointManager } from '../core/TestCheckpointManager';
import { SeedContext } from '../core/interfaces';
import * as path from 'path';

export interface CheckpointTestConfig {
  branchId?: string;
  checkpointDir?: string;
  prisma?: PrismaClient;
}

export class CheckpointTestHelper {
  private orchestrator: SeedOrchestrator;
  private checkpointManager: TestCheckpointManager;
  private prisma: PrismaClient;
  private branchId: string;

  constructor(config: CheckpointTestConfig = {}) {
    this.branchId = config.branchId || 'test-branch';
    this.prisma = config.prisma || new PrismaClient();
    
    const checkpointDir = config.checkpointDir || 
      path.join(process.cwd(), '.test-checkpoints');

    this.checkpointManager = new TestCheckpointManager({
      checkpointDir,
      prisma: this.prisma
    });

    // For testing, we'll create the orchestrator without checkpoints
    // and handle checkpoints manually
    this.orchestrator = new SeedOrchestrator({
      branchId: this.branchId,
      prisma: this.prisma,
      useCheckpoints: false // We'll manage checkpoints manually in tests
    });
  }

  /**
   * Initialize and create base checkpoints if they don't exist
   */
  async initialize(): Promise<void> {
    await this.checkpointManager.init();
    
    const checkpoints = await this.checkpointManager.listCheckpoints();
    
    if (checkpoints.length === 0) {
      console.log('🔄 Creating initial checkpoints...');
      await this.createAllCheckpoints();
    } else {
      console.log(`✅ Found ${checkpoints.length} existing checkpoints`);
    }
  }

  /**
   * Create all checkpoints by running seeders step by step
   */
  async createAllCheckpoints(): Promise<void> {
    console.log('🌱 Running seeders to create test checkpoints...');
    
    // Import seeders directly
    const { TenantSeeder } = await import('../entities/TenantSeeder');
    const { AcademicYearSeeder } = await import('../entities/AcademicYearSeeder');
    const { SubjectSeeder } = await import('../entities/SubjectSeeder');
    const { ClassSeeder } = await import('../entities/ClassSeeder');
    const { TeacherSeeder } = await import('../entities/TeacherSeeder');
    const { StudentSeeder } = await import('../entities/StudentSeeder');
    const { GuardianSeeder } = await import('../entities/GuardianSeeder');
    
    const context: SeedContext = {
      branchId: this.branchId,
      prisma: this.prisma,
      logger: {
        logProgress: () => {},
        logResult: () => {},
        logError: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
        debug: () => {},
        progress: () => {},
        metrics: () => {}
      },
      options: {
        verbose: false,
        dryRun: false,
        batchSize: 100,
        parallel: false
      },
      createdEntities: new Map()
    };
    
    // Run seeders in order and create checkpoints
    const seeders = [
      { name: 'tenants', seeder: new TenantSeeder() },
      { name: 'academicYears', seeder: new AcademicYearSeeder() },
      { name: 'subjects', seeder: new SubjectSeeder() },
      { name: 'classes', seeder: new ClassSeeder() },
      { name: 'teachers', seeder: new TeacherSeeder() },
      { name: 'students', seeder: new StudentSeeder() },
      { name: 'guardians', seeder: new GuardianSeeder() },
      { name: 'enrollments', seeder: new (await import('../entities/EnrollmentSeeder')).EnrollmentSeeder() }
    ];
    
    for (const { name, seeder } of seeders) {
      console.log(`🌱 Seeding ${name}...`);
      const result = await seeder.seed(context);
      
      if (!result.success) {
        throw new Error(`Failed to seed ${name}: ${result.errors?.join(', ')}`);
      }
      
      // Update context with created entities
      if (result.data) {
        context.createdEntities.set(name, result.data);
      }
      
      // Create checkpoint
      await this.checkpointManager.createCheckpoint(name, context);
    }
    
    console.log('✅ All test checkpoints created successfully');
  }

  /**
   * Restore to a specific checkpoint for testing
   */
  async restoreToCheckpoint(checkpointName: string): Promise<SeedContext> {
    await this.checkpointManager.restoreCheckpoint(checkpointName);
    
    // Create a context with the restored state
    const metadata = await this.checkpointManager.getCheckpointMetadata(checkpointName);
    
    const context: SeedContext = {
      branchId: this.branchId,
      prisma: this.prisma,
      logger: {
        logProgress: () => {},
        logResult: () => {},
        logError: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
        debug: () => {},
        progress: () => {},
        metrics: () => {}
      },
      options: {
        verbose: false,
        dryRun: false,
        batchSize: 100,
        parallel: false
      },
      createdEntities: new Map()
    };

    // Restore actual entities to context - fetch them from database
    if (metadata) {
      for (const entityName of metadata.entities) {
        // Fetch the actual entities from the database
        if (entityName === 'tenants') {
          const tenants = await this.prisma.tenant.findMany({ where: { branchId: this.branchId } });
          context.createdEntities.set('tenants', tenants);
        } else if (entityName === 'academicYears') {
          const academicYears = await this.prisma.academicYear.findMany({ where: { branchId: this.branchId } });
          context.createdEntities.set('academicYears', academicYears);
        } else if (entityName === 'subjects') {
          const subjects = await this.prisma.subject.findMany({ where: { branchId: this.branchId } });
          context.createdEntities.set('subjects', subjects);
        } else if (entityName === 'classes') {
          const classes = await this.prisma.class.findMany({ where: { branchId: this.branchId } });
          const sections = await this.prisma.section.findMany({ where: { branchId: this.branchId } });
          context.createdEntities.set('classes', classes);
          context.createdEntities.set('sections', sections); // Add sections too!
        } else if (entityName === 'teachers') {
          const teachers = await this.prisma.teacher.findMany({ where: { branchId: this.branchId } });
          context.createdEntities.set('teachers', teachers);
        } else if (entityName === 'students') {
          const students = await this.prisma.student.findMany({ where: { branchId: this.branchId } });
          context.createdEntities.set('students', students);
        } else if (entityName === 'guardians') {
          const guardians = await this.prisma.guardian.findMany({ where: { branchId: this.branchId } });
          context.createdEntities.set('guardians', guardians);
        } else if (entityName === 'enrollments') {
          const enrollments = await this.prisma.enrollment.findMany({ where: { branchId: this.branchId } });
          context.createdEntities.set('enrollments', enrollments);
        }
      }
    }

    return context;
  }

  /**
   * Run a specific seeder from a checkpoint
   */
  async runSeederFromCheckpoint(
    checkpointName: string,
    seederClass: any
  ): Promise<any> {
    // Restore to checkpoint
    const context = await this.restoreToCheckpoint(checkpointName);
    
    // Create and run the seeder
    const seeder = new seederClass();
    const result = await seeder.seed(context);
    
    return result;
  }

  /**
   * Compare current database state with a checkpoint
   */
  async compareWithCheckpoint(checkpointName: string): Promise<{
    matches: boolean;
    differences: string[];
  }> {
    const differences: string[] = [];
    
    // Get counts from current database
    const currentCounts = await this.getDatabaseCounts();
    
    // Get expected counts from checkpoint metadata
    const metadata = await this.checkpointManager.getCheckpointMetadata(checkpointName);
    
    if (!metadata) {
      return {
        matches: false,
        differences: ['Checkpoint metadata not found']
      };
    }

    // Compare counts
    for (const [entity, expectedCount] of Object.entries(metadata.counts)) {
      const currentCount = currentCounts[entity] || 0;
      if (currentCount !== expectedCount) {
        differences.push(
          `${entity}: expected ${expectedCount}, got ${currentCount}`
        );
      }
    }

    return {
      matches: differences.length === 0,
      differences
    };
  }

  /**
   * Get entity counts from database
   */
  private async getDatabaseCounts(): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    
    // Map entity names to Prisma model names
    const modelMap: Record<string, string> = {
      tenants: 'tenant',
      academicYears: 'academicYear',
      subjects: 'subject',
      classes: 'class',
      sections: 'section',
      teachers: 'teacher',
      students: 'student',
      guardians: 'guardian',
      enrollments: 'enrollment'
    };

    for (const [entityName, modelName] of Object.entries(modelMap)) {
      try {
        const model = (this.prisma as any)[modelName];
        if (model) {
          counts[entityName] = await model.count({
            where: { branchId: this.branchId }
          });
        }
      } catch (error) {
        // Model might not exist
        console.warn(`Could not count ${entityName}: ${error}`);
      }
    }

    return counts;
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

/**
 * Create a test context from a checkpoint
 */
export async function createTestContextFromCheckpoint(
  checkpointName: string,
  branchId: string = 'test-branch'
): Promise<SeedContext> {
  const helper = new CheckpointTestHelper({ branchId });
  await helper.initialize();
  return helper.restoreToCheckpoint(checkpointName);
}