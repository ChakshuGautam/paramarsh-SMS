/**
 * FeeScheduleSeeder Entity
 * Creates fee payment schedules for fee structures
 */

import { BaseSeeder } from '../core/BaseSeeder';
import { SeedContext, SeedResult } from '../core/interfaces';

export class FeeScheduleSeeder extends BaseSeeder {
  public entityName = 'feeSchedules';
  public dependencies = ['classes']; // Changed to classes which exist
  public priority = 72; // After classes

  async seedEntity(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    const schedules: any[] = [];
    const errors: string[] = [];

    try {
      // Check if schedules already exist
      const existingSchedules = await context.prisma.feeSchedule.findMany({
        where: { branchId: context.branchId },
        take: 1
      });
      
      if (existingSchedules.length > 0) {
        // Schedules already exist
        context.createdEntities.set('feeSchedules', existingSchedules);
        return {
          success: true,
          entityName: this.entityName,
          metrics: {
            totalRecords: 0,
            successCount: 0,
            errorCount: 0,
            duration: Date.now() - startTime
          }
        };
      }

      // Create or get fee structures (since we don't have a FeeStructureSeeder)
      let structures = await context.prisma.feeStructure.findMany({
        where: { branchId: context.branchId }
      });

      if (structures.length === 0) {
        // Create basic fee structures for each grade
        const classes = await context.prisma.class.findMany({
          where: { branchId: context.branchId }
        });

        for (const cls of classes) {
          // Check if fee structure already exists for this class
          const existingStructure = await context.prisma.feeStructure.findFirst({
            where: {
              branchId: context.branchId,
              gradeId: cls.id  // Use class ID as the gradeId
            }
          });
          
          if (!existingStructure) {
            const structure = await context.prisma.feeStructure.create({
              data: {
                branchId: context.branchId,
                gradeId: cls.id  // Use class ID as the gradeId
              }
            });
            structures.push(structure);
          } else {
            structures.push(existingStructure);
          }
        }
      }

      // Create schedules for each structure
      for (const structure of structures) {
        try {
          // Check if schedules already exist for this structure
          const existingSchedulesForStructure = await context.prisma.feeSchedule.findMany({
            where: {
              feeStructureId: structure.id
            }
          });

          if (existingSchedulesForStructure.length > 0) {
            schedules.push(...existingSchedulesForStructure);
            continue;
          }

          // Create different payment schedules for the structure
          const paymentSchedules = this.getPaymentSchedules();

          for (const scheduleData of paymentSchedules) {
            const schedule = await context.prisma.feeSchedule.create({
              data: {
                branchId: context.branchId,
                feeStructureId: structure.id,
                recurrence: scheduleData.recurrence,
                dueDayOfMonth: scheduleData.dueDayOfMonth,
                startDate: scheduleData.startDate,
                endDate: scheduleData.endDate,
                status: scheduleData.status
              }
            });

            schedules.push(schedule);
          }

        } catch (error) {
          const errorMsg = `Failed to create fee schedules for structure ${structure.id}: ${error}`;
          errors.push(errorMsg);
        }
      }

      // Store created schedules in context
      context.createdEntities.set('feeSchedules', schedules);

      return {
        success: errors.length === 0,
        entityName: this.entityName,
        metrics: {
          totalRecords: schedules.length,
          successCount: schedules.length,
          errorCount: errors.length,
          duration: Date.now() - startTime
        },
        data: schedules,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      return {
        success: false,
        entityName: this.entityName,
        metrics: {
          totalRecords: 0,
          successCount: 0,
          errorCount: 1,
          duration: Date.now() - startTime
        },
        errors: [new Error(`Critical error in FeeScheduleSeeder: ${error}`)]
      };
    }
  }

  /**
   * Get payment schedules configuration
   */
  private getPaymentSchedules(): Array<{
    recurrence: string,
    dueDayOfMonth: number,
    startDate: string,
    endDate: string | null,
    status: string
  }> {
    const currentYear = new Date().getFullYear();
    const academicStartDate = `${currentYear}-04-01`; // Academic year starts in April
    const academicEndDate = `${currentYear + 1}-03-31`; // Ends in March
    
    return [
      {
        recurrence: 'monthly',
        dueDayOfMonth: 5,  // Due on 5th of every month
        startDate: academicStartDate,
        endDate: academicEndDate,
        status: 'active'
      },
      {
        recurrence: 'quarterly', 
        dueDayOfMonth: 10, // Due on 10th of quarter start
        startDate: academicStartDate,
        endDate: academicEndDate,
        status: 'active'
      },
      {
        recurrence: 'one-time',
        dueDayOfMonth: 15, // One-time fees due on 15th
        startDate: academicStartDate,
        endDate: null, // One-time fees don't have end date
        status: 'active'
      }
    ];
  }
}