/**
 * TeacherAttendanceSeeder Entity
 * Creates teacher attendance records
 */

import { BaseSeeder } from '../core/BaseSeeder';
import { SeedContext, SeedResult } from '../core/interfaces';

export class TeacherAttendanceSeeder extends BaseSeeder {
  public entityName = 'teacherAttendance';
  public dependencies = ['teachers']; 
  public priority = 65; // After teachers

  async seedEntity(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    const records: any[] = [];
    const errors: string[] = [];

    try {
      // Check if records already exist
      const existingRecords = await context.prisma.teacherAttendance.findMany({
        take: 1
      });
      
      if (existingRecords.length > 0) {
        // Records already exist
        context.createdEntities.set('teacherAttendance', existingRecords);
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

      // Get all teachers
      const teachers = await context.prisma.teacher.findMany({
        where: { branchId: context.branchId }
      });

      if (teachers.length === 0) {
        throw new Error('No teachers found');
      }

      // Generate attendance for the last 30 working days
      const today = new Date();
      const dates = this.getWorkingDays(today, 30);

      // Process each teacher
      for (const teacher of teachers) {
        for (const date of dates) {
          try {
            // Format date as YYYY-MM-DD string
            const dateString = date.toISOString().split('T')[0];
            
            // Check if record already exists
            const existingRecord = await context.prisma.teacherAttendance.findUnique({
              where: {
                teacherId_branchId_date: {
                  teacherId: teacher.id,
                  branchId: context.branchId,
                  date: dateString
                }
              }
            });

            if (existingRecord) {
              continue; // Skip if already exists
            }

            // Generate realistic attendance status
            const status = this.generateAttendanceStatus();
            const leaveType = status === 'on_leave' ? this.getLeaveType() : null;
            
            // Set check-in/out times only for present status (as ISO strings)
            let checkIn = null;
            let checkOut = null;
            
            if (status === 'present') {
              // Generate realistic check-in time (7:30 AM to 9:00 AM)
              const checkInHour = 7 + Math.floor(Math.random() * 1.5);
              const checkInMinute = Math.floor(Math.random() * 60);
              const checkInTime = new Date(date);
              checkInTime.setHours(checkInHour, checkInMinute, 0, 0);
              checkIn = checkInTime.toISOString();
              
              // Generate realistic check-out time (3:00 PM to 6:00 PM)
              const checkOutHour = 15 + Math.floor(Math.random() * 3);
              const checkOutMinute = Math.floor(Math.random() * 60);
              const checkOutTime = new Date(date);
              checkOutTime.setHours(checkOutHour, checkOutMinute, 0, 0);
              checkOut = checkOutTime.toISOString();
            }

            const record = await context.prisma.teacherAttendance.create({
              data: {
                branchId: context.branchId,
                teacherId: teacher.id,
                date: dateString,
                checkIn,
                checkOut,
                status,
                leaveType,
                remarks: this.getRemarks(status, leaveType)
              }
            });

            records.push(record);

          } catch (error) {
            const errorMsg = `Failed to create attendance for teacher ${teacher.id} on ${date}: ${error}`;
            errors.push(errorMsg);
          }
        }
      }

      // Store created records in context
      context.createdEntities.set('teacherAttendance', records);

      return {
        success: errors.length === 0,
        entityName: this.entityName,
        metrics: {
          totalRecords: records.length,
          successCount: records.length,
          errorCount: errors.length,
          startTime: new Date(startTime),
          endTime: new Date(),
          duration: Date.now() - startTime
        },
        data: records,
        errors: errors.length > 0 ? errors.map(e => typeof e === "string" ? new Error(e) : e) : [],
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
        errors: [new Error(`Critical error in TeacherAttendanceSeeder: ${error}`)],
        data: [],
        warnings: []
      };
    }
  }

  /**
   * Get working days (excluding weekends) for the last n days
   */
  private getWorkingDays(endDate: Date, numberOfDays: number): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(endDate);
    let daysAdded = 0;

    while (daysAdded < numberOfDays) {
      currentDate.setDate(currentDate.getDate() - 1);
      const dayOfWeek = currentDate.getDay();
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(new Date(currentDate));
        daysAdded++;
      }
    }

    return dates.reverse(); // Return in chronological order
  }

  /**
   * Generate realistic attendance status
   * 90% present, 5% absent, 5% on_leave
   */
  private generateAttendanceStatus(): string {
    const rand = Math.random();
    if (rand < 0.90) return 'present';
    if (rand < 0.95) return 'absent';
    return 'on_leave';
  }

  /**
   * Get random leave type
   */
  private getLeaveType(): string {
    const leaveTypes = ['sick', 'casual', 'earned', 'maternity', 'paternity'];
    return leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
  }

  /**
   * Get remarks based on status and leave type
   */
  private getRemarks(status: string, leaveType: string | null): string | null {
    if (status === 'absent') {
      return 'Absent without notice';
    }
    if (status === 'on_leave' && leaveType) {
      const remarks = {
        'sick': 'Medical leave',
        'casual': 'Personal work',
        'earned': 'Planned vacation',
        'maternity': 'Maternity leave',
        'paternity': 'Paternity leave'
      };
      return remarks[leaveType] || null;
    }
    return null;
  }
}