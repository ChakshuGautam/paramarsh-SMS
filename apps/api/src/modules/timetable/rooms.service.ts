<<<<<<< HEAD
import { Injectable, NotFoundException } from '@nestjs/common';
=======
import { Injectable } from '@nestjs/common';
>>>>>>> origin/main
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.RoomCreateInput) {
    const { branchId } = PrismaService.getScope();
<<<<<<< HEAD
    const room = await this.prisma.room.create({ 
      data: {
        ...data,
        branchId: branchId ?? undefined,
      },
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

    return { data: room };
=======
    return this.prisma.room.create({ 
      data: {
        ...data,
        branchId: branchId ?? undefined,
      }
    });
>>>>>>> origin/main
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

<<<<<<< HEAD
    const data = await this.prisma.room.findMany({
=======
    return this.prisma.room.findMany({
>>>>>>> origin/main
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
<<<<<<< HEAD

    return data; // Return raw data for backward compatibility
  }

  async findOne(id: string) {
    const data = await this.prisma.room.findUnique({
=======
  }

  async findOne(id: string) {
    return this.prisma.room.findUnique({
>>>>>>> origin/main
      where: { id },
      include: {
        constraints: true,
        periods: {
<<<<<<< HEAD
=======
          where: { isActive: true },
>>>>>>> origin/main
          include: {
            subject: true,
            teacher: true,
            section: true,
<<<<<<< HEAD
=======
            timeSlot: true,
>>>>>>> origin/main
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
<<<<<<< HEAD

    if (!data) {
      throw new NotFoundException('Room not found');
    }

    return { data };
  }

  async update(id: string, data: Prisma.RoomUpdateInput) {
    const room = await this.prisma.room.update({
      where: { id },
      data,
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

    return { data: room };
  }

  async remove(id: string) {
    const room = await this.prisma.room.delete({
      where: { id },
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

    return { data: room };
  }

  async checkAvailability(roomId: string, dayOfWeek: number, periodNumber: number, academicYearId: string, date?: Date) {
=======
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
>>>>>>> origin/main
    const effectiveDate = date || new Date();
    
    // Check regular timetable
    const regularPeriod = await this.prisma.timetablePeriod.findFirst({
      where: {
        roomId,
<<<<<<< HEAD
        dayOfWeek,
        periodNumber,
        academicYearId,
=======
        timeSlotId,
        isActive: true,
        effectiveFrom: { lte: effectiveDate },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: effectiveDate } },
        ],
>>>>>>> origin/main
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
<<<<<<< HEAD
        if (constraintValue.dayOfWeek === dayOfWeek && constraintValue.periodNumbers?.includes(periodNumber)) {
=======
        if (constraintValue.slots?.includes(timeSlotId)) {
>>>>>>> origin/main
          return { available: false, reason: 'Room unavailable due to constraint' };
        }
      } catch (e) {
        // Invalid constraint format, ignore
      }
    }

    return { available: true };
  }

<<<<<<< HEAD
  async getRoomUtilization(roomId: string, academicYearId: string) {
    const where: Prisma.TimetablePeriodWhereInput = {
      roomId,
      academicYearId,
    };

    const periods = await this.prisma.timetablePeriod.findMany({
      where,
    });

    // Calculate total possible slots (6 days * periods per day)
    const periodsPerDay = 8; // Assuming 8 periods per day
    const totalSlots = 6 * periodsPerDay; // Monday to Saturday

    const utilizationByDay = Array.from({ length: 7 }, (_, i) => ({
      day: i,
      slotsUsed: periods.filter(p => p.dayOfWeek === i).length,
      totalSlots: i === 0 ? 0 : periodsPerDay, // Sunday has 0 slots
=======
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
>>>>>>> origin/main
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
<<<<<<< HEAD

  // React Admin format methods
  async getList(params: {
    page: number;
    perPage: number;
    sort?: string;
    filter?: any;
    q?: string;
    branchId?: string;
  }) {
    const { page, perPage, sort, filter = {}, q, branchId } = params;
    
    try {
      const where: any = {};
      if (branchId) where.branchId = branchId;
      
      // Apply filters
      Object.keys(filter).forEach(key => {
        if (key !== 'q' && filter[key] !== undefined && filter[key] !== null && filter[key] !== '') {
          if (key === 'minCapacity') {
            where.capacity = { gte: Number(filter[key]) };
          } else if (key === 'isActive') {
            where.isActive = filter[key] === 'true' || filter[key] === true;
          } else {
            where[key] = filter[key];
          }
        }
      });
      
      // Handle search query
      if (q && typeof q === 'string') {
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { code: { contains: q, mode: 'insensitive' } },
          { building: { contains: q, mode: 'insensitive' } },
          { type: { contains: q, mode: 'insensitive' } },
        ];
      }

      // Parse sort parameter
      let orderBy: any = { name: 'asc' }; // default sort
      if (sort) {
        const isDesc = sort.startsWith('-');
        const field = isDesc ? sort.substring(1) : sort;
        const direction = isDesc ? 'desc' : 'asc';
        orderBy = { [field]: direction };
      }

      const [data, total] = await Promise.all([
        this.prisma.room.findMany({
          where,
          orderBy,
          skip: (page - 1) * perPage,
          take: perPage,
          include: {
            constraints: true,
            _count: {
              select: {
                periods: true,
                substitutions: true,
              },
            },
          },
        }),
        this.prisma.room.count({ where }),
      ]);

      return { data, total };
    } catch (error) {
      // Enhanced error handling for database connection issues
      if (error.code === 'P1010') {
        throw new Error(`Database permission error: User does not have access to the database. Please check PostgreSQL user permissions and ensure the user has proper access to the schema.`);
      } else if (error.code?.startsWith('P10')) {
        throw new Error(`Database connection error: ${error.message}. Please check if the database is running and accessible.`);
      } else if (error.code?.startsWith('P20')) {
        throw new Error(`Database schema error: ${error.message}. Please ensure migrations are applied correctly.`);
      }
      
      // Re-throw original error if not a known database error
      throw error;
    }
  }

  async getMany(ids: string[], branchId?: string) {
    const where: any = { 
      id: { in: ids },
    };
    if (branchId) where.branchId = branchId;

    const data = await this.prisma.room.findMany({
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

    return { data };
  }

  async getOne(id: string, branchId?: string) {
    const where: any = { id };
    if (branchId) where.branchId = branchId;

    const data = await this.prisma.room.findFirst({
      where,
      include: {
        constraints: true,
        periods: {
          include: {
            subject: true,
            teacher: true,
            section: true,
          },
        },
        substitutions: {
          where: {
            date: {
              gte: new Date(),
            },
          },
        },
        _count: {
          select: {
            periods: true,
            substitutions: true,
          },
        },
      },
    });

    if (!data) {
      throw new NotFoundException('Room not found');
    }

    return { data };
  }
=======
>>>>>>> origin/main
}