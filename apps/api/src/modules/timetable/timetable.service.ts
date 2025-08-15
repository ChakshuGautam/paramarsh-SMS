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

  async getTimeSlot(id: string) {
    const { branchId } = PrismaService.getScope();
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
    if (sort) {
      const isDesc = sort.startsWith('-');
      const field = isDesc ? sort.substring(1) : sort;
      const direction = isDesc ? 'desc' : 'asc';
      orderBy = { [field]: direction };
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
          timeSlot: true,
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
        timeSlot: true,
      },
    });

    if (!period) {
      throw new BadRequestException('Period not found');
    }

    return period;
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

  async deletePeriod(id: string) {
    const { branchId } = PrismaService.getScope();
    const where: any = { id };
    if (branchId) where.branchId = branchId;

    // Check if period exists
    const period = await this.prisma.timetablePeriod.findFirst({ where });
    if (!period) {
      throw new BadRequestException('Period not found');
    }

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
        });
      }
    }

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
  }
}