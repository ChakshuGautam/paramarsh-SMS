import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TimetableService {
  constructor(private prisma: PrismaService) {}

  async createTimeSlot(data: Prisma.TimeSlotCreateInput) {
    const { branchId } = PrismaService.getScope();
    
    // Check for conflicts
    const existing = await this.prisma.timeSlot.findFirst({
      where: {
        branchId: branchId ?? undefined,
        dayOfWeek: data.dayOfWeek as number,
        slotOrder: data.slotOrder as number,
      },
    });

    if (existing) {
      throw new BadRequestException('Time slot already exists for this day and order');
    }

    return this.prisma.timeSlot.create({ 
      data: {
        ...data,
        branchId: branchId ?? undefined,
      }
    });
  }

  async getTimeSlots() {
    const { branchId } = PrismaService.getScope();
    const where: any = {};
    if (branchId) where.branchId = branchId;
    
    return this.prisma.timeSlot.findMany({
      where,
      orderBy: [
        { dayOfWeek: 'asc' },
        { slotOrder: 'asc' },
      ],
      include: {
        constraints: true,
      },
    });
  }

  async createPeriod(data: {
    sectionId: string;
    subjectId: string;
    teacherId: string;
    roomId?: string;
    timeSlotId: string;
    effectiveFrom?: Date;
  }) {
    const { branchId } = PrismaService.getScope();
    
    // Check for conflicts
    const conflicts = await this.checkPeriodConflicts(data);
    if (conflicts.length > 0) {
      throw new BadRequestException(`Conflicts detected: ${conflicts.join(', ')}`);
    }

    return this.prisma.timetablePeriod.create({
      data: {
        ...data,
        branchId: branchId ?? undefined,
        effectiveFrom: data.effectiveFrom || new Date(),
      },
      include: {
        subject: true,
        teacher: true,
        room: true,
        timeSlot: true,
        section: { include: { class: true } },
      },
    });
  }

  async checkPeriodConflicts(data: {
    sectionId: string;
    teacherId: string;
    roomId?: string;
    timeSlotId: string;
    effectiveFrom?: Date;
  }): Promise<string[]> {
    const conflicts: string[] = [];
    const effectiveFrom = data.effectiveFrom || new Date();

    // Check section conflict
    const sectionConflict = await this.prisma.timetablePeriod.findFirst({
      where: {
        sectionId: data.sectionId,
        timeSlotId: data.timeSlotId,
        isActive: true,
        effectiveFrom: { lte: effectiveFrom },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: effectiveFrom } },
        ],
      },
    });
    
    if (sectionConflict) {
      conflicts.push('Section already has a period in this time slot');
    }

    // Check teacher conflict
    const teacherConflict = await this.prisma.timetablePeriod.findFirst({
      where: {
        teacherId: data.teacherId,
        timeSlotId: data.timeSlotId,
        isActive: true,
        effectiveFrom: { lte: effectiveFrom },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: effectiveFrom } },
        ],
      },
    });
    
    if (teacherConflict) {
      conflicts.push('Teacher already has a period in this time slot');
    }

    // Check room conflict if room is specified
    if (data.roomId) {
      const roomConflict = await this.prisma.timetablePeriod.findFirst({
        where: {
          roomId: data.roomId,
          timeSlotId: data.timeSlotId,
          isActive: true,
          effectiveFrom: { lte: effectiveFrom },
          OR: [
            { effectiveTo: null },
            { effectiveTo: { gte: effectiveFrom } },
          ],
        },
      });
      
      if (roomConflict) {
        conflicts.push('Room already occupied in this time slot');
      }
    }

    return conflicts;
  }

  async getSectionTimetable(sectionId: string) {
    const { branchId } = PrismaService.getScope();
    const where: any = {
      sectionId,
      isActive: true,
      effectiveFrom: { lte: new Date() },
      OR: [
        { effectiveTo: null },
        { effectiveTo: { gte: new Date() } },
      ],
    };
    if (branchId) where.branchId = branchId;
    
    const periods = await this.prisma.timetablePeriod.findMany({
      where,
      include: {
        subject: true,
        teacher: {
          include: { staff: true },
        },
        room: true,
        timeSlot: true,
      },
      orderBy: [
        { timeSlot: { dayOfWeek: 'asc' } },
        { timeSlot: { slotOrder: 'asc' } },
      ],
    });

    // Group by day
    const timetableByDay = periods.reduce((acc, period) => {
      const day = period.timeSlot.dayOfWeek;
      if (!acc[day]) acc[day] = [];
      acc[day].push(period);
      return acc;
    }, {} as Record<number, typeof periods>);

    return timetableByDay;
  }

  async getTeacherTimetable(teacherId: string) {
    const { branchId } = PrismaService.getScope();
    const where: any = {
      teacherId,
      isActive: true,
      effectiveFrom: { lte: new Date() },
      OR: [
        { effectiveTo: null },
        { effectiveTo: { gte: new Date() } },
      ],
    };
    if (branchId) where.branchId = branchId;
    
    const periods = await this.prisma.timetablePeriod.findMany({
      where,
      include: {
        subject: true,
        section: {
          include: { class: true },
        },
        room: true,
        timeSlot: true,
      },
      orderBy: [
        { timeSlot: { dayOfWeek: 'asc' } },
        { timeSlot: { slotOrder: 'asc' } },
      ],
    });

    // Calculate workload
    const workload = {
      totalPeriods: periods.length,
      periodsPerDay: Array.from({ length: 7 }, (_, i) => ({
        day: i,
        count: periods.filter(p => p.timeSlot.dayOfWeek === i).length,
      })),
      subjects: [...new Set(periods.map(p => p.subject.name))],
      classes: [...new Set(periods.map(p => p.section.class.name))],
    };

    return {
      periods,
      workload,
    };
  }

  async createSubstitution(data: {
    periodId: string;
    date: Date;
    substituteTeacherId?: string;
    substituteRoomId?: string;
    reason?: string;
  }) {
    // Check if substitution already exists
    const existing = await this.prisma.substitution.findFirst({
      where: {
        periodId: data.periodId,
        date: data.date,
      },
    });

    if (existing) {
      throw new BadRequestException('Substitution already exists for this period and date');
    }

    // Check substitute teacher availability
    if (data.substituteTeacherId) {
      const period = await this.prisma.timetablePeriod.findUnique({
        where: { id: data.periodId },
        include: { timeSlot: true },
      });

      if (period) {
        const teacherConflict = await this.prisma.timetablePeriod.findFirst({
          where: {
            teacherId: data.substituteTeacherId,
            timeSlotId: period.timeSlotId,
            isActive: true,
          },
        });

        if (teacherConflict) {
          throw new BadRequestException('Substitute teacher is not available at this time');
        }
      }
    }

    return this.prisma.substitution.create({
      data,
      include: {
        period: {
          include: {
            subject: true,
            section: true,
            teacher: true,
            timeSlot: true,
          },
        },
        substituteTeacher: {
          include: { staff: true },
        },
        substituteRoom: true,
      },
    });
  }

  async approveSubstitution(id: string, approvedBy: string) {
    return this.prisma.substitution.update({
      where: { id },
      data: {
        status: 'approved',
        approvedBy,
        approvedAt: new Date(),
      },
    });
  }

  async getSubstitutions(date: Date) {
    return this.prisma.substitution.findMany({
      where: { date },
      include: {
        period: {
          include: {
            subject: true,
            section: { include: { class: true } },
            teacher: { include: { staff: true } },
            room: true,
            timeSlot: true,
          },
        },
        substituteTeacher: {
          include: { staff: true },
        },
        substituteRoom: true,
      },
      orderBy: [
        { period: { timeSlot: { dayOfWeek: 'asc' } } },
        { period: { timeSlot: { slotOrder: 'asc' } } },
      ],
    });
  }

  async generateTimetable(params: {
    sectionId: string;
    subjectAllocations: Array<{
      subjectId: string;
      teacherId: string;
      periodsPerWeek: number;
      preferredRoomId?: string;
    }>;
    constraints?: Array<{
      type: string;
      value: any;
    }>;
  }) {
    // This is a simplified timetable generation algorithm
    // In production, you'd want to use a more sophisticated constraint solver
    
    const { sectionId, subjectAllocations } = params;
    const { branchId } = PrismaService.getScope();
    const where: any = { slotType: 'regular' };
    if (branchId) where.branchId = branchId;
    
    const timeSlots = await this.prisma.timeSlot.findMany({
      where,
      orderBy: [
        { dayOfWeek: 'asc' },
        { slotOrder: 'asc' },
      ],
    });

    const generatedPeriods = [];
    const usedSlots = new Set<string>();

    for (const allocation of subjectAllocations) {
      let periodsAssigned = 0;
      
      for (const slot of timeSlots) {
        if (periodsAssigned >= allocation.periodsPerWeek) break;
        
        const slotKey = `${slot.id}`;
        if (usedSlots.has(slotKey)) continue;

        // Check conflicts
        const conflicts = await this.checkPeriodConflicts({
          sectionId,
          teacherId: allocation.teacherId,
          roomId: allocation.preferredRoomId,
          timeSlotId: slot.id,
        });

        if (conflicts.length === 0) {
          generatedPeriods.push({
            sectionId,
            subjectId: allocation.subjectId,
            teacherId: allocation.teacherId,
            roomId: allocation.preferredRoomId,
            timeSlotId: slot.id,
          });
          usedSlots.add(slotKey);
          periodsAssigned++;
        }
      }

      if (periodsAssigned < allocation.periodsPerWeek) {
        console.warn(
          `Could only assign ${periodsAssigned}/${allocation.periodsPerWeek} periods for subject ${allocation.subjectId}`
        );
      }
    }

    return {
      sectionId,
      totalSlots: timeSlots.length,
      assignedSlots: generatedPeriods.length,
      periods: generatedPeriods,
      preview: true, // This is just a preview, not saved to DB
    };
  }

  async saveTimetable(periods: Array<{
    sectionId: string;
    subjectId: string;
    teacherId: string;
    roomId?: string;
    timeSlotId: string;
  }>) {
    // Deactivate existing timetable for affected sections
    const sectionIds = [...new Set(periods.map(p => p.sectionId))];
    
    await this.prisma.timetablePeriod.updateMany({
      where: {
        sectionId: { in: sectionIds },
        isActive: true,
      },
      data: {
        isActive: false,
        effectiveTo: new Date(),
      },
    });

    // Create new periods
    const createdPeriods = await this.prisma.timetablePeriod.createMany({
      data: periods.map(p => ({
        ...p,
        isActive: true,
        effectiveFrom: new Date(),
      })),
    });

    return {
      sectionsUpdated: sectionIds.length,
      periodsCreated: createdPeriods.count,
    };
  }

  async getTeacherWorkload() {
    const teachers = await this.prisma.teacher.findMany({
      include: {
        staff: true,
        periods: {
          where: { isActive: true },
          include: {
            section: { include: { class: true } },
            subject: true,
          },
        },
      },
    });

    return teachers.map(teacher => ({
      id: teacher.id,
      name: `${teacher.staff.firstName} ${teacher.staff.lastName}`,
      totalPeriods: teacher.periods.length,
      subjects: [...new Set(teacher.periods.map(p => p.subject.name))],
      classes: [...new Set(teacher.periods.map(p => p.section.class.name))],
      averagePerDay: Math.round(teacher.periods.length / 5 * 10) / 10,
    }));
  }

  async getRoomOccupancy() {
    const rooms = await this.prisma.room.findMany({
      where: { isActive: true },
      include: {
        periods: {
          where: { isActive: true },
          include: { timeSlot: true },
        },
      },
    });

    const totalSlots = await this.prisma.timeSlot.count({
      where: { slotType: 'regular' },
    });

    return rooms.map(room => ({
      id: room.id,
      code: room.code,
      name: room.name,
      type: room.type,
      capacity: room.capacity,
      occupiedSlots: room.periods.length,
      totalSlots,
      occupancyRate: Math.round((room.periods.length / totalSlots) * 100),
    }));
  }
}