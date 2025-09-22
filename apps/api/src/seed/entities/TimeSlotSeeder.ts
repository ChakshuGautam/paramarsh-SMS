/**
 * TimeSlotSeeder Entity
 * Generates time slots for school periods and breaks
 */

import { BaseSeeder } from '../core/BaseSeeder';
import { SeedContext, SeedResult } from '../core/interfaces';

// Standard school schedule configuration
const SCHEDULE_CONFIG = {
  startHour: 8,        // School starts at 8:00 AM
  assemblyDuration: 30, // 30 minutes assembly
  periodDuration: 45,   // 45 minutes per period
  shortBreakDuration: 15, // 15 minutes short break
  lunchDuration: 40,    // 40 minutes lunch break
  periodsBeforeLunch: 4, // 4 periods before lunch
  totalPeriods: 8,      // Total 8 periods in a day
};

// Days of the week (1 = Monday, 5 = Friday)
const WEEKDAYS = [1, 2, 3, 4, 5];

interface TimeSlotData {
  startTime: string;
  endTime: string;
  slotType: 'assembly' | 'period' | 'break' | 'lunch';
  slotOrder: number;
}

export class TimeSlotSeeder extends BaseSeeder {
  public entityName = 'timeSlots';
  public dependencies = ['tenants'];
  public priority = 40; // After rooms
  
  async seedEntity(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    const timeSlots: any[] = [];
    const errors: string[] = [];

    try {
      // Check if time slots already exist for this branch
      const existingSlots = await context.prisma.timeSlot.findMany({
        where: { branchId: context.branchId }
      });
      
      if (existingSlots.length > 0) {
        // Time slots already exist, return them with zero new records
        context.createdEntities.set('timeSlots', existingSlots);
        return {
          success: true,
          entityName: this.entityName,
          metrics: {
            totalRecords: 0,  // No new records created
            successCount: 0,  // No new successes
            errorCount: 0,
            startTime: new Date(startTime),
            endTime: new Date(),
            duration: Date.now() - startTime
          },
          data: existingSlots,
          errors: [],
          warnings: []
        };
      }

      // Generate time slots for each weekday
      const schedule = this.generateDaySchedule();
      
      for (const dayOfWeek of WEEKDAYS) {
        for (const slotData of schedule) {
          try {
            const timeSlot = await this.createTimeSlot(context, dayOfWeek, slotData);
            timeSlots.push(timeSlot);
          } catch (error) {
            const errorMsg = `Failed to create time slot for day ${dayOfWeek}, slot ${slotData.slotOrder}: ${error}`;
            errors.push(errorMsg);
          }
        }
      }

      // Store created time slots in context for dependent seeders
      context.createdEntities.set('timeSlots', timeSlots);

      return {
        success: errors.length === 0,
        entityName: this.entityName,
        metrics: {
          totalRecords: timeSlots.length,
          successCount: timeSlots.length,
          errorCount: errors.length,
          startTime: new Date(startTime),
          endTime: new Date(),
          duration: Date.now() - startTime
        },
        data: timeSlots,
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
        errors: [new Error(`Critical error in TimeSlotSeeder: ${error}`)],
        warnings: []
      };
    }
  }

  private generateDaySchedule(): TimeSlotData[] {
    const schedule: TimeSlotData[] = [];
    let currentHour = SCHEDULE_CONFIG.startHour;
    let currentMinute = 0;
    let slotOrder = 1;

    // Assembly (8:00 - 8:30)
    schedule.push({
      startTime: this.formatTime(currentHour, currentMinute),
      endTime: this.formatTime(currentHour, currentMinute + SCHEDULE_CONFIG.assemblyDuration),
      slotType: 'assembly',
      slotOrder: slotOrder++
    });
    currentMinute += SCHEDULE_CONFIG.assemblyDuration;
    this.adjustTime(currentHour, currentMinute);

    // Morning periods (before lunch)
    for (let i = 0; i < SCHEDULE_CONFIG.periodsBeforeLunch; i++) {
      // Add short break after 2 periods
      if (i === 2) {
        const [h, m] = this.adjustTime(currentHour, currentMinute);
        schedule.push({
          startTime: this.formatTime(h, m),
          endTime: this.formatTime(h, m + SCHEDULE_CONFIG.shortBreakDuration),
          slotType: 'break',
          slotOrder: slotOrder++
        });
        currentMinute = m + SCHEDULE_CONFIG.shortBreakDuration;
        [currentHour, currentMinute] = this.adjustTime(h, currentMinute);
      }

      // Regular period
      const [h, m] = this.adjustTime(currentHour, currentMinute);
      schedule.push({
        startTime: this.formatTime(h, m),
        endTime: this.formatTime(h, m + SCHEDULE_CONFIG.periodDuration),
        slotType: 'period',
        slotOrder: slotOrder++
      });
      currentMinute = m + SCHEDULE_CONFIG.periodDuration;
      [currentHour, currentMinute] = this.adjustTime(h, currentMinute);
    }

    // Lunch break
    const [lunchH, lunchM] = this.adjustTime(currentHour, currentMinute);
    schedule.push({
      startTime: this.formatTime(lunchH, lunchM),
      endTime: this.formatTime(lunchH, lunchM + SCHEDULE_CONFIG.lunchDuration),
      slotType: 'lunch',
      slotOrder: slotOrder++
    });
    currentMinute = lunchM + SCHEDULE_CONFIG.lunchDuration;
    [currentHour, currentMinute] = this.adjustTime(lunchH, currentMinute);

    // Afternoon periods
    const remainingPeriods = SCHEDULE_CONFIG.totalPeriods - SCHEDULE_CONFIG.periodsBeforeLunch;
    for (let i = 0; i < remainingPeriods; i++) {
      const [h, m] = this.adjustTime(currentHour, currentMinute);
      schedule.push({
        startTime: this.formatTime(h, m),
        endTime: this.formatTime(h, m + SCHEDULE_CONFIG.periodDuration),
        slotType: 'period',
        slotOrder: slotOrder++
      });
      currentMinute = m + SCHEDULE_CONFIG.periodDuration;
      [currentHour, currentMinute] = this.adjustTime(h, currentMinute);
    }

    return schedule;
  }

  private async createTimeSlot(
    context: SeedContext,
    dayOfWeek: number,
    slotData: TimeSlotData
  ): Promise<any> {
    const timeSlot = await context.prisma.timeSlot.create({
      data: {
        branchId: context.branchId,
        dayOfWeek: dayOfWeek,
        startTime: slotData.startTime,
        endTime: slotData.endTime,
        slotType: slotData.slotType,
        slotOrder: slotData.slotOrder
      }
    });

    return timeSlot;
  }

  private formatTime(hours: number, minutes: number): string {
    // Adjust hours and minutes if minutes >= 60
    const adjustedHours = hours + Math.floor(minutes / 60);
    const adjustedMinutes = minutes % 60;
    
    // Format as HH:MM
    const h = String(adjustedHours).padStart(2, '0');
    const m = String(adjustedMinutes).padStart(2, '0');
    return `${h}:${m}`;
  }

  private adjustTime(hours: number, minutes: number): [number, number] {
    // Adjust hours if minutes >= 60
    const adjustedHours = hours + Math.floor(minutes / 60);
    const adjustedMinutes = minutes % 60;
    return [adjustedHours, adjustedMinutes];
  }
}