import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { 
  validateSubjectGradeAssignment, 
  getGradeLevelFromClassName 
} from './constants/grade-subject-mapping';

@Injectable()
export class TimetableService {
  constructor(private readonly prisma: PrismaService) {}

  async createTimeSlot(data: Prisma.TimeSlotCreateInput) {
    // Temporarily comment out the problematic scope call
    // const { branchId } = PrismaService.getScope();
    const branchId = undefined;
    
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

    const timeSlot = await this.prisma.timeSlot.create({ 
      data: {
        ...data,
        branchId: branchId ?? undefined,
      },
      include: {
        constraints: true,
      },
    });

    return { data: timeSlot };
  }

  async getTimeSlots() {
    // const { branchId } = PrismaService.getScope();
    const branchId = undefined;
    const where: any = {};
    if (branchId) where.branchId = branchId;
    
    const data = await this.prisma.timeSlot.findMany({
      where,
      orderBy: [
        { dayOfWeek: 'asc' },
        { slotOrder: 'asc' },
      ],
      include: {
        constraints: true,
      },
    });

    return { data, total: data.length };
  }

  async getTimeSlot(id: string) {
    // const { branchId } = PrismaService.getScope();
    const branchId = undefined;
    const where: any = { id };
    if (branchId) where.branchId = branchId;

    const timeSlot = await this.prisma.timeSlot.findFirst({
      where,
      include: {
        constraints: true,
      },
    });

    if (!timeSlot) {
      throw new BadRequestException('Time slot not found');
    }

    return timeSlot;
  }

  async getPeriods(options: {
    page?: number;
    pageSize?: number;
    sort?: string;
    sectionId?: string;
    teacherId?: string;
    academicYearId?: string;
  }) {
    const { branchId } = PrismaService.getScope();
    const { page = 1, pageSize = 25, sort, sectionId, teacherId, academicYearId } = options;
    
    const where: any = {};
    if (branchId) where.branchId = branchId;
    if (sectionId) where.sectionId = sectionId;
    if (teacherId) where.teacherId = teacherId;
    if (academicYearId) where.academicYearId = academicYearId;

    // Parse sort parameter with field validation
    let orderBy: any = { dayOfWeek: 'asc' }; // default sort
    if (sort) {
      const isDesc = sort.startsWith('-');
      const field = isDesc ? sort.substring(1) : sort;
      const direction = isDesc ? 'desc' : 'asc';
      
      // Handle nested sort fields and map invalid field names
      if (field === 'class.gradeLevel') {
        orderBy = { section: { class: { gradeLevel: direction } } };
      } else if (field === 'effectiveFrom') {
        // Map effectiveFrom to a valid field - use createdAt as fallback
        orderBy = { createdAt: direction };
      } else {
        // Only allow valid TimetablePeriod fields for sorting
        const allowedSortFields = [
          'id', 'branchId', 'sectionId', 'dayOfWeek', 'periodNumber', 
          'startTime', 'endTime', 'subjectId', 'teacherId', 'roomId', 
          'isBreak', 'breakType', 'academicYearId', 'createdAt', 'updatedAt'
        ];
        
        if (allowedSortFields.includes(field)) {
          orderBy = { [field]: direction };
        } else {
          // Fallback to default sort if invalid field
          console.warn(`Invalid sort field '${field}' for TimetablePeriod, using default sort`);
          orderBy = { dayOfWeek: 'asc' };
        }
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.timetablePeriod.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          section: {
            include: {
              class: true,
            },
          },
          subject: true,
          teacher: {
            include: {
              staff: true,
            },
          },
          room: true,
          academicYear: true,
        },
      }),
      this.prisma.timetablePeriod.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getPeriod(id: string) {
    const { branchId } = PrismaService.getScope();
    const where: any = { id };
    if (branchId) where.branchId = branchId;

    const period = await this.prisma.timetablePeriod.findFirst({
      where,
      include: {
        section: {
          include: {
            class: true,
          },
        },
        subject: true,
        teacher: {
          include: {
            staff: true,
          },
        },
        room: true,
        academicYear: true,
      },
    });

    if (!period) {
      throw new BadRequestException('Period not found');
    }

    return period;
  }

  async createPeriod(data: {
    sectionId: string;
    subjectId?: string;
    teacherId?: string;
    roomId?: string;
    dayOfWeek: number;
    periodNumber: number;
    startTime: string;
    endTime: string;
    academicYearId: string;
    isBreak?: boolean;
    breakType?: string;
  }) {
    const { branchId } = PrismaService.getScope();
    
    // Check for conflicts
    const conflicts = await this.checkPeriodConflicts(data);
    if (conflicts.length > 0) {
      throw new BadRequestException(`Conflicts detected: ${conflicts.join(', ')}`);
    }

    // Check for grade-appropriate subject assignment
    if (data.subjectId && !data.isBreak) {
      const gradeValidation = await this.validateSubjectGradeAppropriatenessForPeriod(
        data.subjectId, 
        data.sectionId
      );
      
      if (!gradeValidation.isValid) {
        throw new BadRequestException(
          `Inappropriate subject assignment: ${gradeValidation.message}. ${gradeValidation.suggestion || ''}`
        );
      }
    }

    return this.prisma.timetablePeriod.create({
      data: {
        ...data,
        branchId: branchId ?? undefined,
      },
      include: {
        subject: true,
        teacher: true,
        room: true,
        section: { include: { class: true } },
        academicYear: true,
      },
    });
  }

  async checkPeriodConflicts(data: {
    sectionId: string;
    teacherId?: string;
    roomId?: string;
    dayOfWeek?: number;
    periodNumber?: number;
    academicYearId?: string;
  }): Promise<string[]> {
    const conflicts: string[] = [];

    // Check section conflict
    if (data.dayOfWeek && data.periodNumber && data.academicYearId) {
      const sectionConflict = await this.prisma.timetablePeriod.findFirst({
        where: {
          sectionId: data.sectionId,
          dayOfWeek: data.dayOfWeek,
          periodNumber: data.periodNumber,
          academicYearId: data.academicYearId,
        },
      });
      
      if (sectionConflict) {
        conflicts.push('Section already has a period in this time slot');
      }

      // Check teacher conflict
      if (data.teacherId) {
        const teacherConflict = await this.prisma.timetablePeriod.findFirst({
          where: {
            teacherId: data.teacherId,
            dayOfWeek: data.dayOfWeek,
            periodNumber: data.periodNumber,
            academicYearId: data.academicYearId,
          },
        });
        
        if (teacherConflict) {
          conflicts.push('Teacher already has a period in this time slot');
        }
      }

      // Check room conflict if room is specified
      if (data.roomId) {
        const roomConflict = await this.prisma.timetablePeriod.findFirst({
          where: {
            roomId: data.roomId,
            dayOfWeek: data.dayOfWeek,
            periodNumber: data.periodNumber,
            academicYearId: data.academicYearId,
          },
        });
        
        if (roomConflict) {
          conflicts.push('Room already occupied in this time slot');
        }
      }
    }

    return conflicts;
  }

  /**
   * Validate that a subject is appropriate for the grade level of a given section
   */
  async validateSubjectGradeAppropriatenessForPeriod(
    subjectId: string, 
    sectionId: string
  ): Promise<{ isValid: boolean; message?: string; suggestion?: string }> {
    const { branchId } = PrismaService.getScope();

    // Get subject and section with class information
    const [subject, section] = await Promise.all([
      this.prisma.subject.findUnique({
        where: { 
          id: subjectId,
          ...(branchId && { branchId })
        },
      }),
      this.prisma.section.findUnique({
        where: { 
          id: sectionId,
          ...(branchId && { branchId })
        },
        include: {
          class: true,
        },
      }),
    ]);

    if (!subject) {
      return {
        isValid: false,
        message: 'Subject not found',
      };
    }

    if (!section?.class) {
      return {
        isValid: false,
        message: 'Section or class not found',
      };
    }

    const gradeLevel = section.class.gradeLevel || getGradeLevelFromClassName(section.class.name);
    return validateSubjectGradeAssignment(subject.name, gradeLevel);
  }

  async deletePeriod(id: string) {
    const { branchId } = PrismaService.getScope();
    const where: any = { id };
    if (branchId) where.branchId = branchId;

    // Check if period exists
    const period = await this.prisma.timetablePeriod.findFirst({ where });
    if (!period) {
      throw new BadRequestException('Period not found');
    }

    // Delete the period
    return this.prisma.timetablePeriod.delete({
      where: { id },
    });
  }

  async getSectionTimetable(sectionId: string, academicYearId?: string) {
    const { branchId } = PrismaService.getScope();
    const where: any = {
      sectionId,
    };
    if (branchId) where.branchId = branchId;
    if (academicYearId) where.academicYearId = academicYearId;
    
    const periods = await this.prisma.timetablePeriod.findMany({
      where,
      include: {
        subject: true,
        teacher: {
          include: { staff: true },
        },
        room: true,
        academicYear: true,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { periodNumber: 'asc' },
      ],
    });

    // Group by day
    const timetableByDay = periods.reduce((acc, period) => {
      const day = period.dayOfWeek;
      if (!acc[day]) acc[day] = [];
      acc[day].push(period);
      return acc;
    }, {} as Record<number, typeof periods>);

    return timetableByDay;
  }

  async getTeacherTimetable(teacherId: string, academicYearId?: string) {
    const { branchId } = PrismaService.getScope();
    const where: any = {
      teacherId,
    };
    if (branchId) where.branchId = branchId;
    if (academicYearId) where.academicYearId = academicYearId;
    
    const periods = await this.prisma.timetablePeriod.findMany({
      where,
      include: {
        subject: true,
        section: {
          include: { class: true },
        },
        room: true,
        academicYear: true,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { periodNumber: 'asc' },
      ],
    });

    // Calculate workload
    const workload = {
      totalPeriods: periods.length,
      periodsPerDay: Array.from({ length: 7 }, (_, i) => ({
        day: i,
        count: periods.filter(p => p.dayOfWeek === i).length,
      })),
      subjects: Array.from(new Set(periods.map(p => p.subject?.name).filter(Boolean))),
      classes: Array.from(new Set(periods.map(p => p.section.class.name))),
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
      });

      if (period) {
        const teacherConflict = await this.prisma.timetablePeriod.findFirst({
          where: {
            teacherId: data.substituteTeacherId,
            dayOfWeek: period.dayOfWeek,
            periodNumber: period.periodNumber,
            academicYearId: period.academicYearId,
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
          },
        },
        substituteTeacher: {
          include: { staff: true },
        },
        substituteRoom: true,
      },
      orderBy: [
        { period: { dayOfWeek: 'asc' } },
        { period: { periodNumber: 'asc' } },
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
    academicYearId: string;
    constraints?: Array<{
      type: string;
      value: any;
    }>;
  }) {
    // This is a simplified timetable generation algorithm
    // In production, you'd want to use a more sophisticated constraint solver
    
    const { sectionId, subjectAllocations, academicYearId } = params;
    const { branchId } = PrismaService.getScope();
    
    // Get available time slots (Monday-Saturday, 8 periods per day)
    const daysPerWeek = 6; // Monday to Saturday
    const periodsPerDay = 8;
    
    const availableSlots: Array<{ dayOfWeek: number; periodNumber: number }> = [];
    for (let day = 1; day <= daysPerWeek; day++) {
      for (let period = 1; period <= periodsPerDay; period++) {
        availableSlots.push({ dayOfWeek: day, periodNumber: period });
      }
    }

    // Shuffle slots for random distribution
    for (let i = availableSlots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableSlots[i], availableSlots[j]] = [availableSlots[j], availableSlots[i]];
    }

    const periods: any[] = [];
    let slotIndex = 0;

    // Allocate periods for each subject
    for (const allocation of subjectAllocations) {
      for (let i = 0; i < allocation.periodsPerWeek; i++) {
        if (slotIndex >= availableSlots.length) {
          throw new BadRequestException('Not enough time slots available');
        }

        const slot = availableSlots[slotIndex++];
        
        // Calculate start and end times based on period number
        const startHour = 8 + Math.floor((slot.periodNumber - 1) * 0.75);
        const startMinute = ((slot.periodNumber - 1) * 45) % 60;
        const endHour = startHour + (startMinute + 45 >= 60 ? 1 : 0);
        const endMinute = (startMinute + 45) % 60;
        
        const startTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
        const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

        periods.push({
          sectionId,
          subjectId: allocation.subjectId,
          teacherId: allocation.teacherId,
          roomId: allocation.preferredRoomId,
          dayOfWeek: slot.dayOfWeek,
          periodNumber: slot.periodNumber,
          startTime,
          endTime,
          academicYearId,
          branchId: branchId ?? undefined,
        });
      }
    }

    // Create all periods in a transaction
    const createdPeriods = await this.prisma.$transaction(
      periods.map(period => 
        this.prisma.timetablePeriod.create({ 
          data: period,
          include: {
            subject: true,
            teacher: true,
            room: true,
            section: true,
          },
        })
      )
    );

    return {
      periodsCreated: createdPeriods.length,
      periods: createdPeriods,
    };
  }

  // React Admin format methods for timetable periods
  async getList(params: {
    page: number;
    perPage: number;
    sort?: string;
    filter?: any;
    q?: string;
    branchId?: string;
  }) {
    const { page, perPage, sort, filter = {}, q, branchId } = params;
    
    const where: any = {};
    if (branchId) where.branchId = branchId;
    
    // Apply filters with proper field mapping
    Object.keys(filter).forEach(key => {
      if (key !== 'q' && filter[key] !== undefined && filter[key] !== null && filter[key] !== '') {
        // Handle nested field mappings
        if (key === 'class') {
          // Skip 'class' filter as it's not a direct field on TimetablePeriod
          // Class filtering should be done via section.class relationship
          return;
        } else if (key === 'classId') {
          where.section = { classId: filter[key] };
        } else if (key === 'sectionId') {
          where.sectionId = filter[key];
        } else if (key === 'subjectId') {
          where.subjectId = filter[key];
        } else if (key === 'teacherId') {
          where.teacherId = filter[key];
        } else if (key === 'roomId') {
          where.roomId = filter[key];
        } else if (key === 'dayOfWeek') {
          where.dayOfWeek = parseInt(filter[key]);
        } else {
          // Only allow known TimetablePeriod fields
          const allowedFields = ['sectionId', 'dayOfWeek', 'periodNumber', 'startTime', 'endTime', 'subjectId', 'teacherId', 'roomId', 'isBreak', 'breakType', 'academicYearId'];
          if (allowedFields.includes(key)) {
            where[key] = filter[key];
          }
        }
      }
    });
    
    // Handle search query
    if (q && typeof q === 'string') {
      where.OR = [
        { subject: { name: { contains: q, mode: 'insensitive' } } },
        { teacher: { staff: { fullName: { contains: q, mode: 'insensitive' } } } },
        { section: { name: { contains: q, mode: 'insensitive' } } },
        { room: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    // Parse sort parameter
    let orderBy: any = { dayOfWeek: 'asc' }; // default sort
    if (sort) {
      const isDesc = sort.startsWith('-');
      const field = isDesc ? sort.substring(1) : sort;
      const direction = isDesc ? 'desc' : 'asc';
      
      // Handle nested sort fields and map invalid field names
      if (field === 'class.gradeLevel') {
        orderBy = { section: { class: { gradeLevel: direction } } };
      } else if (field === 'effectiveFrom') {
        // Map effectiveFrom to a valid field - use createdAt as fallback
        orderBy = { createdAt: direction };
      } else {
        // Only allow valid TimetablePeriod fields for sorting
        const allowedSortFields = [
          'id', 'branchId', 'sectionId', 'dayOfWeek', 'periodNumber', 
          'startTime', 'endTime', 'subjectId', 'teacherId', 'roomId', 
          'isBreak', 'breakType', 'academicYearId', 'createdAt', 'updatedAt'
        ];
        
        if (allowedSortFields.includes(field)) {
          orderBy = { [field]: direction };
        } else {
          // Fallback to default sort if invalid field
          console.warn(`Invalid sort field '${field}' for TimetablePeriod, using default sort`);
          orderBy = { dayOfWeek: 'asc' };
        }
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.timetablePeriod.findMany({
        where,
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          section: {
            include: {
              class: true,
            },
          },
          subject: true,
          teacher: {
            include: {
              staff: true,
            },
          },
          room: true,
          academicYear: true,
        },
      }),
      this.prisma.timetablePeriod.count({ where }),
    ]);

    return { data, total };
  }

  async getMany(ids: string[], branchId?: string) {
    const where: any = { 
      id: { in: ids },
    };
    if (branchId) where.branchId = branchId;

    const data = await this.prisma.timetablePeriod.findMany({
      where,
      include: {
        section: {
          include: {
            class: true,
          },
        },
        subject: true,
        teacher: {
          include: {
            staff: true,
          },
        },
        room: true,
        academicYear: true,
      },
    });

    return { data };
  }

  async getOne(id: string, branchId?: string) {
    const where: any = { id };
    if (branchId) where.branchId = branchId;

    const data = await this.prisma.timetablePeriod.findFirst({
      where,
      include: {
        section: {
          include: {
            class: true,
          },
        },
        subject: true,
        teacher: {
          include: {
            staff: true,
          },
        },
        room: true,
        academicYear: true,
      },
    });

    if (!data) {
      throw new NotFoundException('Timetable period not found');
    }

    return { data };
  }

  // React Admin format methods for time slots
  async getTimeSlotsList(params: {
    page: number;
    perPage: number;
    sort?: string;
    filter?: any;
    q?: string;
    branchId?: string;
  }) {
    const { page, perPage, sort, filter = {}, q, branchId } = params;
    
    const where: any = {};
    if (branchId) where.branchId = branchId;
    
    // Apply filters
    Object.keys(filter).forEach(key => {
      if (key !== 'q' && filter[key] !== undefined && filter[key] !== null && filter[key] !== '') {
        where[key] = filter[key];
      }
    });
    
    // Handle search query
    if (q && typeof q === 'string') {
      where.OR = [
        { startTime: { contains: q, mode: 'insensitive' } },
        { endTime: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Parse sort parameter
    let orderBy: any = [{ dayOfWeek: 'asc' }, { slotOrder: 'asc' }];
    if (sort) {
      const isDesc = sort.startsWith('-');
      const field = isDesc ? sort.substring(1) : sort;
      const direction = isDesc ? 'desc' : 'asc';
      orderBy = { [field]: direction };
    }

    const [data, total] = await Promise.all([
      this.prisma.timeSlot.findMany({
        where,
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          constraints: true,
        },
      }),
      this.prisma.timeSlot.count({ where }),
    ]);

    return { data, total };
  }

  async getManyTimeSlots(ids: string[], branchId?: string) {
    const where: any = { 
      id: { in: ids },
    };
    if (branchId) where.branchId = branchId;

    const data = await this.prisma.timeSlot.findMany({
      where,
      include: {
        constraints: true,
      },
    });

    return { data };
  }

  async getOneTimeSlot(id: string, branchId?: string) {
    const where: any = { id };
    if (branchId) where.branchId = branchId;

    const data = await this.prisma.timeSlot.findFirst({
      where,
      include: {
        constraints: true,
      },
    });

    if (!data) {
      throw new NotFoundException('Time slot not found');
    }

    return { data };
  }

  async updateTimeSlot(id: string, data: any) {
    const updatedTimeSlot = await this.prisma.timeSlot.update({
      where: { id },
      data,
      include: {
        constraints: true,
      },
    });

    return { data: updatedTimeSlot };
  }

  async deleteTimeSlot(id: string) {
    const deletedTimeSlot = await this.prisma.timeSlot.delete({
      where: { id },
      include: {
        constraints: true,
      },
    });

    return { data: deletedTimeSlot };
  }

  // React Admin format methods for substitutions
  async getSubstitutionsList(params: {
    page: number;
    perPage: number;
    sort?: string;
    filter?: any;
    q?: string;
    branchId?: string;
    date?: Date;
  }) {
    const { page, perPage, sort, filter = {}, q, branchId, date } = params;
    
    const where: any = {};
    if (date) where.date = date;
    
    // Apply filters
    Object.keys(filter).forEach(key => {
      if (key !== 'q' && filter[key] !== undefined && filter[key] !== null && filter[key] !== '') {
        where[key] = filter[key];
      }
    });
    
    // Handle search query
    if (q && typeof q === 'string') {
      where.OR = [
        { reason: { contains: q, mode: 'insensitive' } },
        { period: { subject: { name: { contains: q, mode: 'insensitive' } } } },
        { substituteTeacher: { staff: { fullName: { contains: q, mode: 'insensitive' } } } },
      ];
    }

    // Parse sort parameter
    let orderBy: any = [
      { period: { dayOfWeek: 'asc' } },
      { period: { periodNumber: 'asc' } },
    ];
    if (sort) {
      const isDesc = sort.startsWith('-');
      const field = isDesc ? sort.substring(1) : sort;
      const direction = isDesc ? 'desc' : 'asc';
      orderBy = { [field]: direction };
    }

    const [data, total] = await Promise.all([
      this.prisma.substitution.findMany({
        where,
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          period: {
            include: {
              subject: true,
              section: { include: { class: true } },
              teacher: { include: { staff: true } },
              room: true,
            },
          },
          substituteTeacher: {
            include: { staff: true },
          },
          substituteRoom: true,
        },
      }),
      this.prisma.substitution.count({ where }),
    ]);

    return { data, total };
  }

  async getManySubstitutions(ids: string[], branchId?: string) {
    const where: any = { 
      id: { in: ids },
    };

    const data = await this.prisma.substitution.findMany({
      where,
      include: {
        period: {
          include: {
            subject: true,
            section: { include: { class: true } },
            teacher: { include: { staff: true } },
            room: true,
          },
        },
        substituteTeacher: {
          include: { staff: true },
        },
        substituteRoom: true,
      },
    });

    return { data };
  }
}