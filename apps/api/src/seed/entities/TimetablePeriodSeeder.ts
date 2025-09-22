/**
 * TimetablePeriodSeeder Entity
 * Creates timetable periods for each section
 */

import { BaseSeeder } from '../core/BaseSeeder';
import { SeedContext, SeedResult } from '../core/interfaces';

export class TimetablePeriodSeeder extends BaseSeeder {
  public entityName = 'timetablePeriods';
  public dependencies = ['classSubjectTeacher', 'timeSlots', 'rooms', 'academicYears'];
  public priority = 50; // After class-subject-teacher assignments, time slots, and rooms

  async seedEntity(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    const periods: any[] = [];
    const errors: string[] = [];

    try {
      // Check if periods already exist for this branch
      const existingPeriods = await context.prisma.timetablePeriod.findMany({
        where: { branchId: context.branchId }
      });
      
      if (existingPeriods.length > 0) {
        // Periods already exist, return them with zero new records
        context.createdEntities.set('timetablePeriods', existingPeriods);
        return {
          success: true,
          entityName: this.entityName,
          metrics: {
            startTime: new Date(startTime),
            endTime: new Date(),
            totalRecords: 0,  // No new records created
            successCount: 0,  // No new successes
            errorCount: 0,
            duration: Date.now() - startTime
          },
          data: existingPeriods,
          errors: [],
          warnings: []
        };
      }

      // Get academic year
      const academicYear = await context.prisma.academicYear.findFirst({
        where: { branchId: context.branchId, isActive: true }
      });

      if (!academicYear) {
        throw new Error('No active academic year found');
      }

      // Get all required entities
      const sections = await context.prisma.section.findMany({
        where: { branchId: context.branchId },
        include: { class: true }
      });

      const timeSlots = await context.prisma.timeSlot.findMany({
        where: { 
          branchId: context.branchId,
          slotType: { in: ['period', 'lab'] } // Only academic periods
        },
        orderBy: [
          { dayOfWeek: 'asc' },
          { slotOrder: 'asc' }
        ]
      });

      const classSubjectTeachers = await context.prisma.classSubjectTeacher.findMany({
        where: { branchId: context.branchId },
        include: {
          teacher: true,
          subject: true,
          class: true
        }
      });

      const rooms = await context.prisma.room.findMany({
        where: { 
          branchId: context.branchId,
          isActive: true
        }
      });

      if (sections.length === 0 || timeSlots.length === 0 || classSubjectTeachers.length === 0) {
        throw new Error('Required entities (sections/timeSlots/assignments) not found');
      }

      // Track teacher and room availability for conflict resolution
      // Use composite keys for tracking: dayOfWeek-periodNumber
      const teacherSchedule = new Map<string, Set<string>>(); 
      const roomSchedule = new Map<string, Set<string>>();

      // Create periods for each section
      for (const section of sections) {
        // Get assignments for this section's class
        const sectionAssignments = classSubjectTeachers.filter(
          cst => cst.classId === section.classId
        );

        if (sectionAssignments.length === 0) {
          errors.push(`No assignments found for section ${section.name}`);
          continue;
        }

        // Create a weekly schedule for this section
        const weeklyPeriods = this.createWeeklySchedule(
          section,
          sectionAssignments,
          timeSlots,
          rooms,
          teacherSchedule,
          roomSchedule,
          academicYear.id
        );

        // Create the periods in the database
        for (const periodData of weeklyPeriods) {
          try {
            // Check if period already exists
            const existingPeriod = await context.prisma.timetablePeriod.findFirst({
              where: {
                sectionId: periodData.sectionId,
                dayOfWeek: periodData.dayOfWeek,
                periodNumber: periodData.periodNumber,
                academicYearId: periodData.academicYearId
              }
            });

            if (existingPeriod) {
              continue; // Skip if already exists
            }

            const period = await context.prisma.timetablePeriod.create({
              data: {
                branchId: context.branchId,
                ...periodData
              }
            });

            periods.push(period);

            // Update schedules with composite key
            const scheduleKey = `${periodData.dayOfWeek}-${periodData.periodNumber}`;
            
            if (periodData.teacherId) {
              if (!teacherSchedule.has(periodData.teacherId)) {
                teacherSchedule.set(periodData.teacherId, new Set());
              }
              teacherSchedule.get(periodData.teacherId)!.add(scheduleKey);
            }

            if (periodData.roomId) {
              if (!roomSchedule.has(periodData.roomId)) {
                roomSchedule.set(periodData.roomId, new Set());
              }
              roomSchedule.get(periodData.roomId)!.add(scheduleKey);
            }

          } catch (error) {
            const errorMsg = `Failed to create period for section ${section.name}: ${error}`;
            errors.push(errorMsg);
          }
        }
      }

      // Store created periods in context
      context.createdEntities.set('timetablePeriods', periods);

      return {
        success: errors.length === 0,
        entityName: this.entityName,
        metrics: {
          totalRecords: periods.length,
          successCount: periods.length,
          errorCount: errors.length,
          startTime: new Date(startTime),
          endTime: new Date(),
          duration: Date.now() - startTime
        },
        data: periods,
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
        errors: [new Error(`Critical error in TimetablePeriodSeeder: ${error}`)],
        data: [],
        warnings: []
      };
    }
  }

  private createWeeklySchedule(
    section: any,
    assignments: any[],
    timeSlots: any[],
    rooms: any[],
    teacherSchedule: Map<string, Set<string>>,
    roomSchedule: Map<string, Set<string>>,
    academicYearId: string
  ): any[] {
    const periods: any[] = [];
    const subjectPeriodCount = new Map<string, number>(); // Track periods per subject
    
    // Initialize period counts for each subject
    assignments.forEach(assignment => {
      subjectPeriodCount.set(assignment.subjectId, 0);
    });

    // Distribute subjects across the week
    const periodsPerSubjectPerWeek = Math.ceil(timeSlots.length / Math.max(assignments.length, 1));
    
    for (const timeSlot of timeSlots) {
      // Select subject for this time slot (round-robin with variation)
      const selectedAssignment = this.selectSubjectForSlot(
        assignments,
        subjectPeriodCount,
        periodsPerSubjectPerWeek,
        timeSlot
      );

      if (!selectedAssignment) {
        continue; // Skip if no suitable assignment found
      }

      const scheduleKey = `${timeSlot.dayOfWeek}-${timeSlot.slotOrder}`;

      // Find available teacher for this slot
      const teacher = this.findAvailableTeacher(
        selectedAssignment.teacherId,
        scheduleKey,
        teacherSchedule
      );

      // Find available room for this slot
      const room = this.findAvailableRoom(
        rooms,
        scheduleKey,
        roomSchedule,
        selectedAssignment.subject?.name
      );

      periods.push({
        sectionId: section.id,
        dayOfWeek: timeSlot.dayOfWeek,
        periodNumber: timeSlot.slotOrder,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        subjectId: selectedAssignment.subjectId,
        teacherId: teacher,
        roomId: room?.id || null,
        academicYearId: academicYearId
      });

      // Update subject period count
      subjectPeriodCount.set(
        selectedAssignment.subjectId,
        (subjectPeriodCount.get(selectedAssignment.subjectId) || 0) + 1
      );
    }

    return periods;
  }

  private selectSubjectForSlot(
    assignments: any[],
    periodCount: Map<string, number>,
    maxPeriodsPerWeek: number,
    timeSlot: any
  ): any | null {
    // Sort assignments by least scheduled first
    const sortedAssignments = [...assignments].sort((a, b) => {
      const countA = periodCount.get(a.subjectId) || 0;
      const countB = periodCount.get(b.subjectId) || 0;
      return countA - countB;
    });

    // Find assignment with least periods that hasn't exceeded limit
    for (const assignment of sortedAssignments) {
      const count = periodCount.get(assignment.subjectId) || 0;
      
      // Apply subject-specific period allocation rules
      const subjectName = assignment.subject?.name || '';
      let targetPeriods = maxPeriodsPerWeek;
      
      // Core subjects get more periods
      if (['Mathematics', 'Science', 'English', 'Hindi'].includes(subjectName)) {
        targetPeriods = Math.ceil(maxPeriodsPerWeek * 1.5);
      }
      // Physical Education and Art get fewer periods
      else if (['Physical Education', 'Art'].includes(subjectName)) {
        targetPeriods = Math.ceil(maxPeriodsPerWeek * 0.5);
      }

      if (count < targetPeriods) {
        return assignment;
      }
    }

    // If all subjects have enough periods, return the one with least
    return sortedAssignments[0] || null;
  }

  private findAvailableTeacher(
    teacherId: string,
    scheduleKey: string,
    schedule: Map<string, Set<string>>
  ): string | null {
    if (!teacherId) return null;

    const teacherSlots = schedule.get(teacherId) || new Set();
    
    // Check if teacher is available for this time slot
    if (!teacherSlots.has(scheduleKey)) {
      return teacherId;
    }

    // Teacher is busy, return null
    return null;
  }

  private findAvailableRoom(
    rooms: any[],
    scheduleKey: string,
    schedule: Map<string, Set<string>>,
    subjectName?: string
  ): any | null {
    // Prefer specific room types for certain subjects
    let preferredType: string | null = null;
    
    if (subjectName?.includes('Computer')) {
      preferredType = 'computer_lab';
    } else if (subjectName?.includes('Science')) {
      preferredType = 'science_lab';
    } else if (subjectName?.includes('Physical Education')) {
      preferredType = 'sports_hall';
    }

    // Sort rooms by preference and availability
    const availableRooms = rooms.filter(room => {
      const roomSlots = schedule.get(room.id) || new Set();
      return !roomSlots.has(scheduleKey);
    });

    if (availableRooms.length === 0) {
      return null;
    }

    // Find preferred type room if specified
    if (preferredType) {
      const preferredRoom = availableRooms.find(r => r.type === preferredType);
      if (preferredRoom) return preferredRoom;
    }

    // Return any available room
    return availableRooms[Math.floor(Math.random() * availableRooms.length)];
  }
}