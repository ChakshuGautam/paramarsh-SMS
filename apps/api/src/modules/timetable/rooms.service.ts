import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.RoomCreateInput) {
    const { branchId } = PrismaService.getScope();
    return this.prisma.room.create({ 
      data: {
        ...data,
        branchId: branchId ?? undefined,
      }
    });
  }

  async findAll(filters?: {
    type?: string;
    building?: string;
    minCapacity?: number;
    isActive?: boolean;
  }) {
    const { branchId } = PrismaService.getScope();
    const where: Prisma.RoomWhereInput = {};
    if (branchId) where.branchId = branchId;
    
    if (filters?.type) where.type = filters.type;
    if (filters?.building) where.building = filters.building;
    if (filters?.minCapacity) where.capacity = { gte: filters.minCapacity };
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    return this.prisma.room.findMany({
      where,
      include: {
        constraints: true,
        _count: {
          select: {
            periods: true,
            substitutions: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.room.findUnique({
      where: { id },
      include: {
        constraints: true,
        periods: {
          where: { isActive: true },
          include: {
            subject: true,
            teacher: true,
            section: true,
            timeSlot: true,
          },
        },
        substitutions: {
          where: {
            date: {
              gte: new Date(),
            },
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.RoomUpdateInput) {
    return this.prisma.room.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.room.delete({
      where: { id },
    });
  }

  async checkAvailability(roomId: string, timeSlotId: string, date?: Date) {
    const effectiveDate = date || new Date();
    
    // Check regular timetable
    const regularPeriod = await this.prisma.timetablePeriod.findFirst({
      where: {
        roomId,
        timeSlotId,
        isActive: true,
        effectiveFrom: { lte: effectiveDate },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: effectiveDate } },
        ],
      },
    });

    if (regularPeriod) {
      // Check for substitutions
      if (date) {
        const substitution = await this.prisma.substitution.findFirst({
          where: {
            periodId: regularPeriod.id,
            date,
            status: 'approved',
          },
        });
        
        if (substitution && substitution.substituteRoomId !== roomId) {
          return { available: true, reason: 'Room freed due to substitution' };
        }
      }
      
      return { available: false, periodId: regularPeriod.id };
    }

    // Check constraints
    const constraint = await this.prisma.roomConstraint.findFirst({
      where: {
        roomId,
        type: 'unavailable_slots',
      },
    });

    if (constraint) {
      try {
        const constraintValue = JSON.parse(constraint.value);
        if (constraintValue.slots?.includes(timeSlotId)) {
          return { available: false, reason: 'Room unavailable due to constraint' };
        }
      } catch (e) {
        // Invalid constraint format, ignore
      }
    }

    return { available: true };
  }

  async getRoomUtilization(roomId: string, startDate?: Date, endDate?: Date) {
    const where: Prisma.TimetablePeriodWhereInput = {
      roomId,
      isActive: true,
    };

    if (startDate && endDate) {
      where.effectiveFrom = { lte: endDate };
      where.OR = [
        { effectiveTo: null },
        { effectiveTo: { gte: startDate } },
      ];
    }

    const periods = await this.prisma.timetablePeriod.findMany({
      where,
      include: { timeSlot: true },
    });

    const totalSlots = await this.prisma.timeSlot.count({
      where: { slotType: 'regular' },
    });

    const utilizationByDay = Array.from({ length: 7 }, (_, i) => ({
      day: i,
      slotsUsed: periods.filter(p => p.timeSlot.dayOfWeek === i).length,
      totalSlots: totalSlots / 7,
      percentage: 0,
    }));

    utilizationByDay.forEach(day => {
      day.percentage = day.totalSlots > 0 
        ? Math.round((day.slotsUsed / day.totalSlots) * 100)
        : 0;
    });

    return {
      roomId,
      totalPeriods: periods.length,
      utilizationByDay,
      averageUtilization: Math.round(
        utilizationByDay.reduce((sum, day) => sum + day.percentage, 0) / 7
      ),
    };
  }

  async addConstraint(roomId: string, constraint: {
    type: string;
    value: string;
    priority?: number;
  }) {
    return this.prisma.roomConstraint.create({
      data: {
        roomId,
        ...constraint,
      },
    });
  }
}