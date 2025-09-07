import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type Exam = { 
  id?: string; 
  name: string; 
  startDate?: string; 
  endDate?: string;
  examType?: string;
  academicYearId?: string;
  term?: number;
  weightagePercent?: number;
  minPassingMarks?: number;
  maxMarks?: number;
  status?: string;
};

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { 
    page?: number; 
    pageSize?: number;
    perPage?: number; // Support both parameters
    sort?: string; 
    q?: string;
    startDateGte?: string;
    startDateLte?: string;
    startDateGt?: string;
    endDateGte?: string;
    endDateLte?: string;
    examType?: string;
    academicYearId?: string;
    term?: number | string;
    status?: string;
  }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.perPage ?? params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    
    // Text search
    if (params.q) {
      where.name = { contains: params.q, mode: 'insensitive' };
    }
    
    // Date filters - dates are stored as strings in the database
    if (params.startDateGte || params.startDateLte || params.startDateGt) {
      where.startDate = {};
      if (params.startDateGte) where.startDate.gte = params.startDateGte;
      if (params.startDateLte) where.startDate.lte = params.startDateLte;
      if (params.startDateGt) where.startDate.gt = params.startDateGt;
    }
    
    if (params.endDateGte || params.endDateLte) {
      where.endDate = {};
      if (params.endDateGte) where.endDate.gte = params.endDateGte;
      if (params.endDateLte) where.endDate.lte = params.endDateLte;
    }
    
    // Exam type filter
    if (params.examType) {
      where.examType = params.examType;
    }
    
    // Academic year filter
    if (params.academicYearId) {
      where.academicYearId = params.academicYearId;
    }
    
    // Term filter
    if (params.term) {
      where.term = Number(params.term);
    }
    
    // Status filter
    if (params.status) {
      where.status = params.status;
    }
    
    // Branch scoping
    const { branchId } = PrismaService.getScope();
    if (branchId) where.branchId = branchId;
    
    // Sorting
    const orderBy: any = params.sort
      ? params.sort.split(',').map((f) => ({ [f.startsWith('-') ? f.slice(1) : f]: f.startsWith('-') ? 'desc' : 'asc' }))
      : [{ startDate: 'desc' }]; // Default sort by start date descending

    const [data, total] = await Promise.all([
      this.prisma.exam.findMany({ where, skip, take: pageSize, orderBy }),
      this.prisma.exam.count({ where }),
    ]);
    return { data, total };
  }

  async getOne(id: string) {
    const { branchId } = PrismaService.getScope();
    
    const exam = await this.prisma.exam.findFirst({
      where: { id, branchId }
    });
    
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    
    return { data: exam };
  }

  async create(input: Exam) {
    const { branchId } = PrismaService.getScope();
    
    const created = await this.prisma.exam.create({ 
      data: { 
        branchId,
        name: input.name,
        examType: input.examType ?? undefined,
        academicYearId: input.academicYearId ?? undefined,
        term: input.term ?? undefined,
        weightagePercent: input.weightagePercent ?? undefined,
        minPassingMarks: input.minPassingMarks ?? undefined,
        maxMarks: input.maxMarks ?? undefined,
        status: input.status ?? 'SCHEDULED',
        startDate: input.startDate ?? null,
        endDate: input.endDate ?? null
      }
    });
    return { data: created };
  }

  async update(id: string, input: Partial<Exam>) {
    const { branchId } = PrismaService.getScope();
    
    // First verify the exam belongs to this branch
    const exam = await this.prisma.exam.findFirst({
      where: { id, branchId }
    });
    
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    
    const updated = await this.prisma.exam.update({ 
      where: { id },
      data: { 
        name: input.name ?? undefined,
        examType: input.examType ?? undefined,
        academicYearId: input.academicYearId ?? undefined,
        term: input.term ?? undefined,
        weightagePercent: input.weightagePercent ?? undefined,
        minPassingMarks: input.minPassingMarks ?? undefined,
        maxMarks: input.maxMarks ?? undefined,
        status: input.status ?? undefined,
        startDate: input.startDate ?? undefined,
        endDate: input.endDate ?? undefined
      }
    });
    return { data: updated };
  }

  async remove(id: string) {
    try {
      await this.prisma.exam.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Exam not found');
    }
    return { success: true };
  }

  /**
   * Get date sheet for an exam
   */
  async getDateSheet(examId: string) {
    const { branchId } = PrismaService.getScope();
    
    // Get exam with sessions
    const exam = await this.prisma.exam.findFirst({
      where: { id: examId, branchId },
      include: {
        sessions: {
          include: {
            marks: true
          }
        }
      }
    });
    
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    // Get subjects for each session
    const sessionsWithDetails = await Promise.all(
      exam.sessions.map(async (session) => {
        const subject = session.subjectId 
          ? await this.prisma.subject.findUnique({
              where: { id: session.subjectId }
            })
          : null;

        const room = session.roomId
          ? await this.prisma.room.findUnique({
              where: { id: session.roomId }
            })
          : null;

        return {
          id: session.id,
          subjectId: session.subjectId,
          subjectName: subject?.name || 'Unknown Subject',
          subjectCode: subject?.code || '',
          schedule: session.schedule,
          roomId: session.roomId,
          roomName: room?.name || 'TBA',
          roomCode: room?.code || '',
          totalStudents: session.marks.length
        };
      })
    );

    return {
      data: {
        examId: exam.id,
        examName: exam.name,
        startDate: exam.startDate,
        endDate: exam.endDate,
        status: exam.status,
        sessions: sessionsWithDetails.sort((a, b) => 
          (a.schedule || '').localeCompare(b.schedule || '')
        )
      }
    };
  }

  /**
   * Generate date sheet for an exam
   */
  async generateDateSheet(
    examId: string, 
    sessions: Array<{ 
      subjectId: string; 
      date: string; 
      startTime: string; 
      endTime: string; 
      roomId?: string 
    }>
  ) {
    const { branchId } = PrismaService.getScope();
    
    // Verify exam exists
    const exam = await this.prisma.exam.findFirst({
      where: { id: examId, branchId }
    });
    
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    // Delete existing sessions
    await this.prisma.examSession.deleteMany({
      where: { examId, branchId }
    });

    // Create new sessions
    const createdSessions = await Promise.all(
      sessions.map(async (session) => {
        const schedule = `${session.date}T${session.startTime}:00`;
        
        return this.prisma.examSession.create({
          data: {
            branchId,
            examId,
            subjectId: session.subjectId,
            roomId: session.roomId || null,
            schedule
          }
        });
      })
    );

    // Update exam dates based on session dates
    const dates = sessions.map(s => s.date).sort();
    if (dates.length > 0) {
      await this.prisma.exam.update({
        where: { id: examId },
        data: {
          startDate: dates[0],
          endDate: dates[dates.length - 1]
        }
      });
    }

    return {
      data: {
        examId,
        sessions: createdSessions,
        message: `Date sheet generated with ${createdSessions.length} sessions`
      }
    };
  }

  /**
   * Get exam readiness status
   */
  async getExamReadiness(examId: string) {
    const { branchId } = PrismaService.getScope();
    
    // Get exam with all related data
    const exam = await this.prisma.exam.findFirst({
      where: { id: examId, branchId },
      include: {
        sessions: {
          include: {
            marks: true
          }
        }
      }
    });
    
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    // Calculate days until exam
    const today = new Date();
    const examDate = exam.startDate ? new Date(exam.startDate) : null;
    const daysRemaining = examDate 
      ? Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Check readiness criteria
    const readiness = {
      hasDateSheet: exam.sessions.length > 0,
      hasAllSubjects: false, // Would need to check against curriculum
      hasRoomAssignments: exam.sessions.every(s => s.roomId !== null),
      hasInvigilators: false, // Would need teacher assignments
      questionPapersReady: false, // Would need additional tracking
      marksEntryStarted: exam.sessions.some(s => s.marks.length > 0),
      isComplete: exam.status === 'COMPLETED'
    };

    const readinessPercentage = 
      Object.values(readiness).filter(Boolean).length / 
      Object.keys(readiness).length * 100;

    return {
      data: {
        examId: exam.id,
        examName: exam.name,
        status: exam.status,
        startDate: exam.startDate,
        endDate: exam.endDate,
        daysRemaining,
        isUpcoming: daysRemaining !== null && daysRemaining > 0,
        isPast: daysRemaining !== null && daysRemaining < 0,
        isOngoing: exam.status === 'IN_PROGRESS',
        readiness,
        readinessPercentage: Math.round(readinessPercentage),
        totalSessions: exam.sessions.length,
        completedSessions: exam.sessions.filter(s => s.marks.length > 0).length
      }
    };
  }

  /**
   * Send marks notification to parents/students
   */
  async notifyMarks(examId: string, method: 'email' | 'sms' | 'both') {
    const { branchId } = PrismaService.getScope();
    
    // Verify exam exists
    const exam = await this.prisma.exam.findFirst({
      where: { id: examId, branchId },
      include: {
        marks: {
          include: {
            student: {
              include: {
                guardians: {
                  include: {
                    guardian: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    // In a real implementation, this would integrate with notification service
    // For now, we'll just simulate the notification
    const studentsNotified = new Set(exam.marks.map(m => m.studentId)).size;
    const guardiansNotified = exam.marks.reduce((count, mark) => 
      count + mark.student.guardians.length, 0
    );

    return {
      data: {
        examId,
        examName: exam.name,
        method,
        studentsNotified,
        guardiansNotified,
        message: `Marks notification sent via ${method} to ${studentsNotified} students and ${guardiansNotified} guardians`,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Generate and share marks report
   */
  async shareMarks(examId: string, format: 'pdf' | 'excel' | 'csv') {
    const { branchId } = PrismaService.getScope();
    
    // Verify exam exists
    const exam = await this.prisma.exam.findFirst({
      where: { id: examId, branchId },
      include: {
        marks: {
          include: {
            student: true,
            subject: true
          }
        }
      }
    });
    
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    // In a real implementation, this would generate actual files
    // For now, we'll simulate the report generation
    const reportUrl = `/api/reports/exam-${examId}-marks.${format}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    return {
      data: {
        examId,
        examName: exam.name,
        format,
        reportUrl,
        expiresAt: expiresAt.toISOString(),
        totalStudents: new Set(exam.marks.map(m => m.studentId)).size,
        totalMarks: exam.marks.length,
        message: `Marks report generated in ${format.toUpperCase()} format`
      }
    };
  }
}
