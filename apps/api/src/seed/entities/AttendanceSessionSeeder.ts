/**
 * AttendanceSessionSeeder Entity
 * Creates attendance sessions for timetable periods
 */

import { BaseSeeder } from '../core/BaseSeeder';
import { SeedContext, SeedResult } from '../core/interfaces';

export class AttendanceSessionSeeder extends BaseSeeder {
  public entityName = 'attendanceSessions';
  public dependencies = ['timetablePeriods']; 
  public priority = 55; // After timetable periods

  async seedEntity(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    const sessions: any[] = [];
    const errors: string[] = [];

    try {
      // Check if sessions already exist for this branch
      const existingSessions = await context.prisma.attendanceSession.findMany({
        where: { branchId: context.branchId }
      });
      
      if (existingSessions.length > 0) {
        // Sessions already exist, return them with zero new records
        context.createdEntities.set('attendanceSessions', existingSessions);
        return {
          success: true,
          entityName: this.entityName,
          metrics: {
            totalRecords: 0,
            successCount: 0,
            errorCount: 0,
            startTime: new Date(startTime),
            endTime: new Date(),
            duration: Date.now() - startTime
          },
          data: existingSessions,
          errors: [],
          warnings: []
        };
      }

      // Get timetable periods
      const periods = await context.prisma.timetablePeriod.findMany({
        where: { 
          branchId: context.branchId,
          isBreak: false // Only academic periods
        },
        include: {
          section: true,
          subject: true,
          teacher: true
        }
      });

      if (periods.length === 0) {
        throw new Error('No timetable periods found');
      }

      // Generate attendance sessions for the current week and last week
      const today = new Date();
      const currentWeekStart = this.getWeekStart(today);
      const lastWeekStart = new Date(currentWeekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);

      // Generate sessions for two weeks
      const weeks = [lastWeekStart, currentWeekStart];
      
      for (const weekStart of weeks) {
        for (const period of periods) {
          // Calculate the actual date for this period
          const sessionDate = new Date(weekStart);
          sessionDate.setDate(sessionDate.getDate() + (period.dayOfWeek - 1));
          
          // Skip weekends (Saturday = 6, Sunday = 0 in dayOfWeek)
          if (period.dayOfWeek === 0 || period.dayOfWeek > 5) {
            continue;
          }

          // Determine if this is a past session (for marking as completed)
          const isPast = sessionDate < today;
          const status = isPast && Math.random() > 0.1 ? 'completed' : 'scheduled';
          
          // Create session time from period times
          const [startHour, startMin] = period.startTime.split(':').map(Number);
          const [endHour, endMin] = period.endTime.split(':').map(Number);
          
          const startTime = new Date(sessionDate);
          startTime.setHours(startHour, startMin, 0, 0);
          
          const endTime = new Date(sessionDate);
          endTime.setHours(endHour, endMin, 0, 0);

          try {
            // Check if session already exists
            const existingSession = await context.prisma.attendanceSession.findFirst({
              where: {
                periodId: period.id,
                date: sessionDate
              }
            });

            if (existingSession) {
              continue; // Skip if already exists
            }

            // Skip periods without teacher or subject (e.g., breaks, free periods)
            if (!period.teacherId || !period.subjectId) {
              continue;
            }

            const session = await context.prisma.attendanceSession.create({
              data: {
                branchId: context.branchId,
                date: sessionDate,
                periodId: period.id,
                sectionId: period.sectionId,
                subjectId: period.subjectId,
                assignedTeacherId: period.teacherId,
                actualTeacherId: status === 'completed' ? period.teacherId : null,
                startTime: status === 'completed' ? startTime : null,
                endTime: status === 'completed' ? endTime : null,
                status,
                lockedAt: status === 'completed' ? endTime : null
              }
            });

            sessions.push(session);

          } catch (error) {
            const errorMsg = `Failed to create session for period ${period.id}: ${error}`;
            errors.push(errorMsg);
          }
        }
      }

      // Store created sessions in context
      context.createdEntities.set('attendanceSessions', sessions);

      return {
        success: errors.length === 0,
        entityName: this.entityName,
        metrics: {
          totalRecords: sessions.length,
          successCount: sessions.length,
          errorCount: errors.length,
          startTime: new Date(startTime),
          endTime: new Date(),
          duration: Date.now() - startTime
        },
        data: sessions,
        errors: errors.length > 0 ? errors.map(e => new Error(e)) : [],
        warnings: []
      };

    } catch (error) {
      return {
        success: false,
        entityName: this.entityName,
        metrics: {
          totalRecords: 0,
          successCount: 0,
          errorCount: 1,
          startTime: new Date(startTime),
          endTime: new Date(),
          duration: Date.now() - startTime
        },
        data: [],
        errors: [new Error(`Critical error in AttendanceSessionSeeder: ${error}`)],
        warnings: []
      };
    }
  }

  /**
   * Get the start of the week (Monday) for a given date
   */
  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}