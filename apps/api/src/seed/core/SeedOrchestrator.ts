/**
 * SeedOrchestrator with Checkpoint Support
 * Manages the execution of seeders in dependency order with database snapshots
 */

import { PrismaClient } from '@prisma/client';
import { SeedContext, SeedResult } from './interfaces';
import { BaseSeeder } from './BaseSeeder';
import { SeedLogger } from './SeedLogger';
import { CheckpointManager } from './CheckpointManager';

// Import all seeders
import { TenantSeeder } from '../entities/TenantSeeder';
import { AcademicYearSeeder } from '../entities/AcademicYearSeeder';
import { SubjectSeeder } from '../entities/SubjectSeeder';
import { ClassSeeder } from '../entities/ClassSeeder';
import { TeacherSeeder } from '../entities/TeacherSeeder';
import { StudentSeeder } from '../entities/StudentSeeder';
import { GuardianSeeder } from '../entities/GuardianSeeder';
import { EnrollmentSeeder } from '../entities/EnrollmentSeeder';
import { RoomSeeder } from '../entities/RoomSeeder';
import { TimeSlotSeeder } from '../entities/TimeSlotSeeder';
import { FeeStructureSeeder } from '../entities/FeeStructureSeeder';
import { FeeComponentSeeder } from '../entities/FeeComponentSeeder';
import { FeeScheduleSeeder } from '../entities/FeeScheduleSeeder';
import { ClassSubjectTeacherSeeder } from '../entities/ClassSubjectTeacherSeeder';
import { InvoiceSeeder } from '../entities/InvoiceSeeder';
import { PaymentSeeder } from '../entities/PaymentSeeder';
import { TimetablePeriodSeeder } from '../entities/TimetablePeriodSeeder';
import { ExamSeeder } from '../entities/ExamSeeder';
import { ExamSessionSeeder } from '../entities/ExamSessionSeeder';
import { MarkSeeder } from '../entities/MarkSeeder';
import { AttendanceSessionSeeder } from '../entities/AttendanceSessionSeeder';
import { StudentPeriodAttendanceSeeder } from '../entities/StudentPeriodAttendanceSeeder';
import { TeacherAttendanceSeeder } from '../entities/TeacherAttendanceSeeder';

export interface OrchestratorOptions {
  branchId: string;
  prisma?: PrismaClient;
  verbose?: boolean;
  dryRun?: boolean;
  parallel?: boolean;
  batchSize?: number;
  useCheckpoints?: boolean;
  checkpointDir?: string;
  restoreFromCheckpoint?: string;
}

export class SeedOrchestrator {
  private seeders: BaseSeeder[] = [];
  private logger: SeedLogger;
  private checkpointManager?: CheckpointManager;
  private context: SeedContext;

  constructor(private options: OrchestratorOptions) {
    this.logger = new SeedLogger();
    
    // Initialize checkpoint manager if enabled
    if (options.useCheckpoints) {
      this.checkpointManager = new CheckpointManager({
        checkpointDir: options.checkpointDir,
        useDocker: false // Set based on your environment
      });
    }

    // Initialize context
    this.context = {
      branchId: options.branchId,
      prisma: options.prisma || new PrismaClient(),
      logger: this.logger,
      options: {
        verbose: options.verbose || false,
        dryRun: options.dryRun || false,
        batchSize: options.batchSize || 100,
        parallel: options.parallel || false
      },
      createdEntities: new Map()
    };

    // Register seeders in dependency order
    this.registerSeeders();
  }

  private registerSeeders() {
    // Add seeders in dependency order
    this.seeders = [
      new TenantSeeder(),
      new AcademicYearSeeder(),
      new SubjectSeeder(),
      new ClassSeeder(),
      new TimeSlotSeeder(),
      new TeacherSeeder(),
      new StudentSeeder(),
      new GuardianSeeder(),
      new EnrollmentSeeder(),
      new RoomSeeder(),
      new FeeStructureSeeder(),
      new FeeComponentSeeder(),
      new FeeScheduleSeeder(),
      new ClassSubjectTeacherSeeder(),
      new InvoiceSeeder(),
      new PaymentSeeder(),
      new TimetablePeriodSeeder(),
      new ExamSeeder(),
      new ExamSessionSeeder(),
      new MarkSeeder(),
      new AttendanceSessionSeeder(),
      new StudentPeriodAttendanceSeeder(),
      new TeacherAttendanceSeeder(),
    ];

    // Sort by priority
    this.seeders.sort((a, b) => a.priority - b.priority);
  }

  async seed(): Promise<{ success: boolean; results: SeedResult[] }> {
    const results: SeedResult[] = [];
    
    try {
      // Initialize checkpoint manager if enabled
      if (this.checkpointManager) {
        await this.checkpointManager.init();
        
        // Restore from checkpoint if specified
        if (this.options.restoreFromCheckpoint) {
          await this.checkpointManager.restoreCheckpoint(this.options.restoreFromCheckpoint);
          
          // Load checkpoint metadata to restore context
          const metadata = await this.checkpointManager.getCheckpointMetadata(
            this.options.restoreFromCheckpoint
          );
          
          if (metadata) {
            console.log(`📊 Restored to checkpoint: ${this.options.restoreFromCheckpoint}`);
            console.log(`   Entities present: ${metadata.entities.join(', ')}`);
            
            // Skip seeders that were already run
            const completedSeeders = metadata.entities;
            this.seeders = this.seeders.filter(s => !completedSeeders.includes(s.entityName));
          }
        }
      }

      // Execute seeders in order
      for (const seeder of this.seeders) {
        this.logger.logProgress(seeder.entityName, 'seeding', 0, 1);
        
        if (this.options.verbose) {
          console.log(`\n🌱 Seeding ${seeder.entityName}...`);
        }

        const result = await seeder.seed(this.context);
        results.push(result);

        if (!result.success) {
          this.logger.logError(seeder.entityName, result.errors || ['Unknown error']);
          
          if (!this.options.dryRun) {
            // Stop on first failure in production
            break;
          }
        } else {
          this.logger.logProgress(seeder.entityName, 'completed', 1, 1);
          
          // Create checkpoint after successful seeding
          if (this.checkpointManager && !this.options.dryRun) {
            await this.checkpointManager.createCheckpoint(
              seeder.entityName,
              this.context
            );
          }
        }
      }

      // Clean up old checkpoints
      if (this.checkpointManager) {
        await this.checkpointManager.cleanup(10); // Keep last 10 checkpoints
      }

      const allSuccess = results.every(r => r.success);
      
      if (allSuccess) {
        console.log('\n✅ All seeders completed successfully!');
      } else {
        console.log('\n⚠️ Some seeders failed. Check the logs for details.');
      }

      return {
        success: allSuccess,
        results
      };

    } catch (error) {
      console.error('Fatal error in orchestrator:', error);
      return {
        success: false,
        results
      };
    } finally {
      // Disconnect Prisma if we created it
      if (!this.options.prisma) {
        await this.context.prisma.$disconnect();
      }
    }
  }

  /**
   * List available checkpoints
   */
  async listCheckpoints(): Promise<string[]> {
    if (!this.checkpointManager) {
      throw new Error('Checkpoints not enabled');
    }
    return this.checkpointManager.listCheckpoints();
  }

  /**
   * Get checkpoint information
   */
  async getCheckpointInfo(name: string): Promise<any> {
    if (!this.checkpointManager) {
      throw new Error('Checkpoints not enabled');
    }
    return this.checkpointManager.getCheckpointMetadata(name);
  }
}