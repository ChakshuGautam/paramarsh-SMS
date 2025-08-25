<<<<<<< HEAD
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
=======
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TimetableService {
  constructor(private prisma: PrismaService) {}

  async createTimeSlot(data: Prisma.TimeSlotCreateInput) {
    const { branchId } = PrismaService.getScope();
>>>>>>> origin/main
    
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

<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
      where,
      orderBy: [
        { dayOfWeek: 'asc' },
        { slotOrder: 'asc' },
      ],
      include: {
        constraints: true,
      },
    });
<<<<<<< HEAD

    return { data, total: data.length };
  }

  async getTimeSlot(id: string) {
    // const { branchId } = PrismaService.getScope();
    const branchId = undefined;
=======
  }

  async getTimeSlot(id: string) {
    const { branchId } = PrismaService.getScope();
>>>>>>> origin/main
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
<<<<<<< HEAD
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
=======
    isActive?: boolean;
    sectionId?: string;
    teacherId?: string;
  }) {
    const { branchId } = PrismaService.getScope();
    const { page = 1, pageSize = 25, sort, isActive, sectionId, teacherId } = options;
    
    const where: any = {};
    if (branchId) where.branchId = branchId;
    if (isActive !== undefined) where.isActive = isActive;
    if (sectionId) where.sectionId = sectionId;
    if (teacherId) where.teacherId = teacherId;

    // Parse sort parameter (e.g., "-effectiveFrom" means desc order)
    let orderBy: any = { effectiveFrom: 'desc' }; // default sort
>>>>>>> origin/main
    if (sort) {
      const isDesc = sort.startsWith('-');
      const field = isDesc ? sort.substring(1) : sort;
      const direction = isDesc ? 'desc' : 'asc';
<<<<<<< HEAD
      
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
=======
      orderBy = { [field]: direction };
>>>>>>> origin/main
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
<<<<<<< HEAD
          academicYear: true,
=======
          timeSlot: true,
>>>>>>> origin/main
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
<<<<<<< HEAD
        academicYear: true,
=======
        timeSlot: true,
>>>>>>> origin/main
      },
    });

    if (!period) {
      throw new BadRequestException('Period not found');
    }

    return period;
  }

  async createPeriod(data: {
    sectionId: string;
<<<<<<< HEAD
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
=======
    subjectId: string;
    teacherId: string;
    roomId?: string;
    timeSlotId: string;
    effectiveFrom?: Date;
>>>>>>> origin/main
  }) {
    const { branchId } = PrismaService.getScope();
    
    // Check for conflicts
    const conflicts = await this.checkPeriodConflicts(data);
    if (conflicts.length > 0) {
      throw new BadRequestException(`Conflicts detected: ${conflicts.join(', ')}`);
    }

<<<<<<< HEAD
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

=======
>>>>>>> origin/main
    return this.prisma.timetablePeriod.create({
      data: {
        ...data,
        branchId: branchId ?? undefined,
<<<<<<< HEAD
=======
        effectiveFrom: data.effectiveFrom || new Date(),
>>>>>>> origin/main
      },
      include: {
        subject: true,
        teacher: true,
        room: true,
<<<<<<< HEAD
        section: { include: { class: true } },
        academicYear: true,
=======
        timeSlot: true,
        section: { include: { class: true } },
>>>>>>> origin/main
      },
    });
  }

  async checkPeriodConflicts(data: {
    sectionId: string;
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
      }
    }

    return conflicts;
  }

<<<<<<< HEAD
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

=======
>>>>>>> origin/main
  async deletePeriod(id: string) {
    const { branchId } = PrismaService.getScope();
    const where: any = { id };
    if (branchId) where.branchId = branchId;

    // Check if period exists
    const period = await this.prisma.timetablePeriod.findFirst({ where });
    if (!period) {
      throw new BadRequestException('Period not found');
    }

<<<<<<< HEAD
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
=======
    // Soft delete by setting isActive to false
    return this.prisma.timetablePeriod.update({
      where: { id },
      data: {
        isActive: false,
        effectiveTo: new Date(),
      },
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
        timeSlot: true,
      },
    });
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
>>>>>>> origin/main
    
    const periods = await this.prisma.timetablePeriod.findMany({
      where,
      include: {
        subject: true,
        teacher: {
          include: { staff: true },
        },
        room: true,
<<<<<<< HEAD
        academicYear: true,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { periodNumber: 'asc' },
=======
        timeSlot: true,
      },
      orderBy: [
        { timeSlot: { dayOfWeek: 'asc' } },
        { timeSlot: { slotOrder: 'asc' } },
>>>>>>> origin/main
      ],
    });

    // Group by day
    const timetableByDay = periods.reduce((acc, period) => {
<<<<<<< HEAD
      const day = period.dayOfWeek;
=======
      const day = period.timeSlot.dayOfWeek;
>>>>>>> origin/main
      if (!acc[day]) acc[day] = [];
      acc[day].push(period);
      return acc;
    }, {} as Record<number, typeof periods>);

    return timetableByDay;
  }

<<<<<<< HEAD
  async getTeacherTimetable(teacherId: string, academicYearId?: string) {
    const { branchId } = PrismaService.getScope();
    const where: any = {
      teacherId,
    };
    if (branchId) where.branchId = branchId;
    if (academicYearId) where.academicYearId = academicYearId;
=======
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
>>>>>>> origin/main
    
    const periods = await this.prisma.timetablePeriod.findMany({
      where,
      include: {
        subject: true,
        section: {
          include: { class: true },
        },
        room: true,
<<<<<<< HEAD
        academicYear: true,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { periodNumber: 'asc' },
=======
        timeSlot: true,
      },
      orderBy: [
        { timeSlot: { dayOfWeek: 'asc' } },
        { timeSlot: { slotOrder: 'asc' } },
>>>>>>> origin/main
      ],
    });

    // Calculate workload
    const workload = {
      totalPeriods: periods.length,
      periodsPerDay: Array.from({ length: 7 }, (_, i) => ({
        day: i,
<<<<<<< HEAD
        count: periods.filter(p => p.dayOfWeek === i).length,
      })),
      subjects: Array.from(new Set(periods.map(p => p.subject?.name).filter(Boolean))),
      classes: Array.from(new Set(periods.map(p => p.section.class.name))),
=======
        count: periods.filter(p => p.timeSlot.dayOfWeek === i).length,
      })),
      subjects: [...new Set(periods.map(p => p.subject.name))],
      classes: [...new Set(periods.map(p => p.section.class.name))],
>>>>>>> origin/main
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
<<<<<<< HEAD
=======
        include: { timeSlot: true },
>>>>>>> origin/main
      });

      if (period) {
        const teacherConflict = await this.prisma.timetablePeriod.findFirst({
          where: {
            teacherId: data.substituteTeacherId,
<<<<<<< HEAD
            dayOfWeek: period.dayOfWeek,
            periodNumber: period.periodNumber,
            academicYearId: period.academicYearId,
=======
            timeSlotId: period.timeSlotId,
            isActive: true,
>>>>>>> origin/main
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
<<<<<<< HEAD
=======
            timeSlot: true,
>>>>>>> origin/main
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
<<<<<<< HEAD
=======
            timeSlot: true,
>>>>>>> origin/main
          },
        },
        substituteTeacher: {
          include: { staff: true },
        },
        substituteRoom: true,
      },
      orderBy: [
<<<<<<< HEAD
        { period: { dayOfWeek: 'asc' } },
        { period: { periodNumber: 'asc' } },
=======
        { period: { timeSlot: { dayOfWeek: 'asc' } } },
        { period: { timeSlot: { slotOrder: 'asc' } } },
>>>>>>> origin/main
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
<<<<<<< HEAD
    academicYearId: string;
=======
>>>>>>> origin/main
    constraints?: Array<{
      type: string;
      value: any;
    }>;
  }) {
    // This is a simplified timetable generation algorithm
    // In production, you'd want to use a more sophisticated constraint solver
    
<<<<<<< HEAD
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
=======
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

  async generateCompleteTimetable(branchId?: string) {
    // Get all active data
    const sections = await this.prisma.section.findMany({
      where: { branchId },
      include: {
        class: true,
        enrollments: { 
          where: { status: 'active' },
          include: { student: true }
        },
      },
    });

    const teachers = await this.prisma.teacher.findMany({
      where: { 
        branchId,
        staff: { status: 'active' }
      },
      include: {
        staff: true,
      },
    });

    const subjects = await this.prisma.subject.findMany({
      where: { branchId },
    });

    const timeSlots = await this.prisma.timeSlot.findMany({
      where: { 
        branchId,
        slotType: 'regular'
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { slotOrder: 'asc' },
      ],
    });

    const rooms = await this.prisma.room.findMany({
      where: { branchId, isActive: true },
    });

    if (sections.length === 0 || teachers.length === 0 || subjects.length === 0 || timeSlots.length === 0) {
      throw new BadRequestException('Insufficient data to generate timetable');
    }

    // Create subject allocation strategy
    const coreSubjects = subjects.filter(s => 
      ['Mathematics', 'English', 'Science', 'Social Studies', 'Hindi'].includes(s.name)
    );
    const otherSubjects = subjects.filter(s => 
      !['Mathematics', 'English', 'Science', 'Social Studies', 'Hindi'].includes(s.name)
    );

    const generatedPeriods = [];
    let periodsCreated = 0;

    for (const section of sections) {
      console.log(`Generating timetable for ${section.class.name} ${section.name}...`);
      
      // Assign core subjects (more periods per week)
      for (const subject of coreSubjects) {
        const periodsPerWeek = this.getPeriodsPerWeek(subject.name, section.class.name);
        const assignedTeacher = this.assignTeacherToSubject(subject, teachers);
        
        if (assignedTeacher) {
          const assignedPeriods = await this.assignPeriodsToSection(
            section.id,
            subject.id,
            assignedTeacher.id,
            periodsPerWeek,
            timeSlots,
            generatedPeriods,
            rooms
          );
          generatedPeriods.push(...assignedPeriods);
          periodsCreated += assignedPeriods.length;
        }
      }

      // Assign other subjects (fewer periods per week)
      for (const subject of otherSubjects) {
        const periodsPerWeek = this.getPeriodsPerWeek(subject.name, section.class.name);
        const assignedTeacher = this.assignTeacherToSubject(subject, teachers);
        
        if (assignedTeacher && periodsPerWeek > 0) {
          const assignedPeriods = await this.assignPeriodsToSection(
            section.id,
            subject.id,
            assignedTeacher.id,
            periodsPerWeek,
            timeSlots,
            generatedPeriods,
            rooms
          );
          generatedPeriods.push(...assignedPeriods);
          periodsCreated += assignedPeriods.length;
        }
      }
    }

    return {
      message: 'Complete timetable generated successfully',
      sectionsProcessed: sections.length,
      totalPeriods: periodsCreated,
      teachersUsed: [...new Set(generatedPeriods.map(p => p.teacherId))].length,
      subjectsAssigned: [...new Set(generatedPeriods.map(p => p.subjectId))].length,
      preview: generatedPeriods,
    };
  }

  private getPeriodsPerWeek(subjectName: string, className: string): number {
    // Define periods per week based on subject importance and class level
    const subjectPeriods: Record<string, number> = {
      'Mathematics': 6,
      'English': 5,
      'Science': 4,
      'Social Studies': 3,
      'Hindi': 4,
      'Physical Education': 2,
      'Computer Science': 2,
      'Art': 1,
      'Music': 1,
      'Library': 1,
    };

    // Adjust based on class level
    let periods = subjectPeriods[subjectName] || 2;
    
    // Primary classes might have fewer periods for advanced subjects
    if (className.includes('1') || className.includes('2') || className.includes('3')) {
      if (subjectName === 'Computer Science') periods = 1;
      if (subjectName === 'Science') periods = 3;
    }

    return periods;
  }

  private assignTeacherToSubject(subject: any, teachers: any[]): any {
    // For now, use the subjects field if available or match by subject name
    const nameMatch = teachers.find(t => 
      t.subjects && t.subjects.toLowerCase().includes(subject.name.toLowerCase())
    );
    
    if (nameMatch) return nameMatch;

    // Subject-specific assignment logic
    const subjectTeacherMap: Record<string, string[]> = {
      'Mathematics': ['Math', 'Science'],
      'English': ['English', 'Language'],
      'Science': ['Science', 'Biology', 'Chemistry', 'Physics'],
      'Social Studies': ['History', 'Geography', 'Civics'],
      'Hindi': ['Hindi', 'Language'],
      'Computer Science': ['Computer', 'IT'],
      'Physical Education': ['Sports', 'PE'],
      'Art': ['Art', 'Drawing'],
      'Music': ['Music'],
    };

    const subjectKeywords = subjectTeacherMap[subject.name] || [subject.name];
    
    const qualifiedTeacher = teachers.find(t => 
      subjectKeywords.some(keyword => 
        (t.subjects && t.subjects.toLowerCase().includes(keyword.toLowerCase())) ||
        (t.staff.position && t.staff.position.toLowerCase().includes(keyword.toLowerCase()))
      )
    );

    if (qualifiedTeacher) return qualifiedTeacher;

    // Random assignment as last resort
    return teachers[Math.floor(Math.random() * teachers.length)];
  }

  private async assignPeriodsToSection(
    sectionId: string,
    subjectId: string,
    teacherId: string,
    periodsPerWeek: number,
    timeSlots: any[],
    existingPeriods: any[],
    rooms: any[]
  ): Promise<any[]> {
    const assignedPeriods = [];
    let periodsAssigned = 0;

    // Try to distribute periods across different days
    const slotsByDay = timeSlots.reduce((acc, slot) => {
      if (!acc[slot.dayOfWeek]) acc[slot.dayOfWeek] = [];
      acc[slot.dayOfWeek].push(slot);
      return acc;
    }, {} as Record<number, any[]>);

    const days = Object.keys(slotsByDay).map(Number).sort();
    
    for (let attempt = 0; attempt < periodsPerWeek * 2 && periodsAssigned < periodsPerWeek; attempt++) {
      const day = days[attempt % days.length];
      const daySlots = slotsByDay[day];
      
      for (const slot of daySlots) {
        if (periodsAssigned >= periodsPerWeek) break;

        // Check if this slot is already used for this section
        const sectionConflict = existingPeriods.some(p => 
          p.sectionId === sectionId && p.timeSlotId === slot.id
        );
        
        // Check if teacher is already assigned to this slot
        const teacherConflict = existingPeriods.some(p => 
          p.teacherId === teacherId && p.timeSlotId === slot.id
        );

        if (!sectionConflict && !teacherConflict) {
          // Assign a room
          const availableRoom = rooms.find(r => 
            !existingPeriods.some(p => p.roomId === r.id && p.timeSlotId === slot.id)
          );

          assignedPeriods.push({
            sectionId,
            subjectId,
            teacherId,
            timeSlotId: slot.id,
            roomId: availableRoom?.id || null,
          });
          
          periodsAssigned++;
        }
      }
    }

    return assignedPeriods;
  }

  async saveTimetablePeriods(periods: any[], branchId?: string) {
    // Clear existing timetable
    await this.prisma.timetablePeriod.updateMany({
      where: { branchId, isActive: true },
      data: { isActive: false, effectiveTo: new Date() },
    });

    // Create new periods
    const createdPeriods = await this.prisma.timetablePeriod.createMany({
      data: periods.map(p => ({
        ...p,
        branchId,
        isActive: true,
        effectiveFrom: new Date(),
      })),
    });

    return {
      periodsCreated: createdPeriods.count,
      message: 'Timetable saved successfully',
    };
  }

  async getTimetableGrid(sectionId: string) {
    const { branchId } = PrismaService.getScope();
    
    // Get all time slots
    const timeSlots = await this.prisma.timeSlot.findMany({
      where: { branchId, slotType: 'regular' },
      orderBy: [
        { dayOfWeek: 'asc' },
        { slotOrder: 'asc' },
      ],
    });

    // Get all periods for this section
    const periods = await this.prisma.timetablePeriod.findMany({
      where: {
        sectionId,
        branchId,
        isActive: true,
      },
      include: {
        subject: true,
        teacher: {
          include: {
            staff: true,
          },
        },
        room: true,
        timeSlot: true,
      },
    });

    // Get section info
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        class: true,
      },
    });

    // Create grid structure
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const grid: Record<number, Record<string, any>> = {};

    // Initialize grid
    timeSlots.forEach(slot => {
      if (!grid[slot.dayOfWeek]) {
        grid[slot.dayOfWeek] = {};
      }
      grid[slot.dayOfWeek][slot.id] = null;
    });

    // Fill grid with periods
    periods.forEach(period => {
      const dayOfWeek = period.timeSlot.dayOfWeek;
      const timeSlotId = period.timeSlot.id;
      
      grid[dayOfWeek][timeSlotId] = {
        id: period.id,
        subject: {
          id: period.subject.id,
          name: period.subject.name,
        },
        teacher: {
          id: period.teacher.id,
          name: `${period.teacher.staff.firstName} ${period.teacher.staff.lastName}`,
        },
        room: period.room ? {
          id: period.room.id,
          name: period.room.name,
        } : null,
      };
    });

    // Convert to array format for easier frontend handling
    const gridData = Object.keys(grid).map(dayOfWeek => ({
      day: parseInt(dayOfWeek),
      dayName: days[parseInt(dayOfWeek)],
      periods: timeSlots
        .filter(slot => slot.dayOfWeek === parseInt(dayOfWeek))
        .map(slot => ({
          timeSlot: {
            id: slot.id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            slotOrder: slot.slotOrder,
          },
          period: grid[parseInt(dayOfWeek)][slot.id],
        })),
    })).filter(day => day.periods.length > 0);

    return {
      section: {
        id: section?.id,
        name: section?.name,
        className: section?.class.name,
      },
      grid: gridData,
      timeSlots: timeSlots.map(slot => ({
        id: slot.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        slotOrder: slot.slotOrder,
      })),
    };
  }

  async checkTeacherConflicts(data: {
    periodId?: string;
    teacherId: string;
    timeSlotId: string;
    date?: string;
  }) {
    const { branchId } = PrismaService.getScope();
    const conflicts = [];

    // Get the time slot details
    const timeSlot = await this.prisma.timeSlot.findUnique({
      where: { id: data.timeSlotId },
    });

    if (!timeSlot) {
      return { conflicts: ['Invalid time slot'] };
    }

    // Check for existing periods with this teacher at this time
    const existingPeriods = await this.prisma.timetablePeriod.findMany({
      where: {
        branchId,
        teacherId: data.teacherId,
        timeSlotId: data.timeSlotId,
        isActive: true,
        ...(data.periodId ? { id: { not: data.periodId } } : {}),
      },
      include: {
        section: {
          include: {
            class: true,
          },
        },
        subject: true,
        timeSlot: true,
      },
    });

    existingPeriods.forEach(period => {
      conflicts.push({
        type: 'teacher_conflict',
        message: `Teacher already scheduled for ${period.section.class.name}-${period.section.name} (${period.subject.name}) at ${timeSlot.startTime}-${timeSlot.endTime}`,
        conflictingPeriod: {
          id: period.id,
          section: `${period.section.class.name}-${period.section.name}`,
          subject: period.subject.name,
          timeSlot: `${timeSlot.startTime}-${timeSlot.endTime}`,
        },
      });
    });

    // Check teacher availability if date is provided
    if (data.date) {
      const attendanceDate = new Date(data.date);
      const teacherAttendance = await this.prisma.teacherDailyAttendance.findFirst({
        where: {
          branchId,
          teacherId: data.teacherId,
          date: attendanceDate,
          status: { in: ['absent', 'leave'] },
        },
      });

      if (teacherAttendance) {
        conflicts.push({
          type: 'teacher_unavailable',
          message: `Teacher is marked as ${teacherAttendance.status} on this date`,
>>>>>>> origin/main
        });
      }
    }

<<<<<<< HEAD
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
=======
    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
    };
  }

  async updatePeriod(periodId: string, updateData: {
    teacherId?: string;
    subjectId?: string;
    roomId?: string;
  }) {
    const { branchId } = PrismaService.getScope();

    // Get the existing period
    const existingPeriod = await this.prisma.timetablePeriod.findUnique({
      where: { id: periodId },
      include: {
        timeSlot: true,
      },
    });

    if (!existingPeriod) {
      throw new BadRequestException('Period not found');
    }

    // Check for conflicts if teacher is being changed
    if (updateData.teacherId && updateData.teacherId !== existingPeriod.teacherId) {
      const conflictCheck = await this.checkTeacherConflicts({
        periodId,
        teacherId: updateData.teacherId,
        timeSlotId: existingPeriod.timeSlotId,
      });

      if (conflictCheck.hasConflicts) {
        throw new BadRequestException(
          `Cannot update period: ${conflictCheck.conflicts.map(c => c.message).join(', ')}`
        );
      }
    }

    // Update the period
    const updatedPeriod = await this.prisma.timetablePeriod.update({
      where: { id: periodId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        subject: true,
        teacher: {
          include: {
            staff: true,
          },
        },
        room: true,
        timeSlot: true,
        section: {
          include: {
            class: true,
          },
        },
      },
    });

    return {
      message: 'Period updated successfully',
      period: {
        id: updatedPeriod.id,
        subject: {
          id: updatedPeriod.subject.id,
          name: updatedPeriod.subject.name,
        },
        teacher: {
          id: updatedPeriod.teacher.id,
          name: `${updatedPeriod.teacher.staff.firstName} ${updatedPeriod.teacher.staff.lastName}`,
        },
        room: updatedPeriod.room ? {
          id: updatedPeriod.room.id,
          name: updatedPeriod.room.name,
        } : null,
        timeSlot: {
          startTime: updatedPeriod.timeSlot.startTime,
          endTime: updatedPeriod.timeSlot.endTime,
        },
        section: `${updatedPeriod.section.class.name}-${updatedPeriod.section.name}`,
      },
    };
>>>>>>> origin/main
  }
}