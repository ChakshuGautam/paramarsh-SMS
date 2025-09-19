/**
 * StudentPeriodAttendanceSeeder Entity
 * Creates student attendance records for attendance sessions
 */

import { BaseSeeder } from '../core/BaseSeeder';
import { SeedContext, SeedResult } from '../core/interfaces';

export class StudentPeriodAttendanceSeeder extends BaseSeeder {
  public entityName = 'studentPeriodAttendance';
  public dependencies = ['attendanceSessions', 'enrollments']; 
  public priority = 60; // After attendance sessions and enrollments

  async seedEntity(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    const records: any[] = [];
    const errors: string[] = [];

    try {
      // Check if records already exist
      const existingRecords = await context.prisma.studentPeriodAttendance.findMany({
        take: 1
      });
      
      if (existingRecords.length > 0) {
        // Records already exist
        context.createdEntities.set('studentPeriodAttendance', existingRecords);
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

      // Get completed attendance sessions
      const completedSessions = await context.prisma.attendanceSession.findMany({
        where: { 
          branchId: context.branchId,
          status: 'completed'
        },
        include: {
          section: true
        }
      });

      if (completedSessions.length === 0) {
        // No completed sessions to mark attendance for
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

      // Process each session
      for (const session of completedSessions) {
        // Get enrolled students in this section
        const enrollments = await context.prisma.enrollment.findMany({
          where: {
            branchId: context.branchId,
            sectionId: session.sectionId,
            status: 'active'
          },
          include: {
            student: true
          }
        });

        // Create attendance records for each student
        for (const enrollment of enrollments) {
          try {
            // Check if record already exists
            const existingRecord = await context.prisma.studentPeriodAttendance.findUnique({
              where: {
                sessionId_studentId: {
                  sessionId: session.id,
                  studentId: enrollment.studentId
                }
              }
            });

            if (existingRecord) {
              continue; // Skip if already exists
            }

            // Generate realistic attendance status
            const status = this.generateAttendanceStatus();
            const minutesLate = status === 'late' ? Math.floor(Math.random() * 30) + 1 : null;
            const reason = status === 'absent' ? this.getAbsenceReason() : null;

            const record = await context.prisma.studentPeriodAttendance.create({
              data: {
                sessionId: session.id,
                studentId: enrollment.studentId,
                status,
                minutesLate,
                reason,
                notes: status === 'absent' ? 'Parent informed' : null,
                markedAt: session.date,
                markedBy: session.assignedTeacherId
              }
            });

            records.push(record);

          } catch (error) {
            const errorMsg = `Failed to create attendance record for student ${enrollment.studentId} in session ${session.id}: ${error}`;
            errors.push(errorMsg);
          }
        }
      }

      // Store created records in context
      context.createdEntities.set('studentPeriodAttendance', records);

      return {
        success: errors.length === 0,
        entityName: this.entityName,
        metrics: {
          totalRecords: records.length,
          successCount: records.length,
          errorCount: errors.length,
          duration: Date.now() - startTime
        },
        data: records,
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
        errors: [new Error(`Critical error in StudentPeriodAttendanceSeeder: ${error}`)]
      };
    }
  }

  /**
   * Generate realistic attendance status
   * 85% present, 7% late, 8% absent
   */
  private generateAttendanceStatus(): string {
    const rand = Math.random();
    if (rand < 0.85) return 'present';
    if (rand < 0.92) return 'late';
    return 'absent';
  }

  /**
   * Get random absence reason
   */
  private getAbsenceReason(): string {
    const reasons = [
      'Sick',
      'Family emergency',
      'Medical appointment',
      'Festival celebration',
      'Out of station',
      'Weather conditions',
      'Transportation issue'
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }
}