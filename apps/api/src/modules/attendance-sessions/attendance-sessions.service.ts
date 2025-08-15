import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AttendanceSessionsService {
  constructor(private prisma: PrismaService) {}

  // Get current period's session for a teacher
  async getCurrentSession(teacherId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Find current time slot based on current time
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes
    
    const timeSlot = await this.prisma.timeSlot.findFirst({
      where: {
        // Parse start and end time from string format (e.g., "09:00")
        AND: [
          // This is simplified - you'd need to parse the time strings properly
        ]
      }
    });
    
    if (!timeSlot) return null;
    
    // Find or create session for current period
    const period = await this.prisma.timetablePeriod.findFirst({
      where: {
        teacherId,
        timeSlotId: timeSlot.id,
        isActive: true,
      },
      include: {
        section: true,
        subject: true,
        teacher: {
          include: {
            staff: true
          }
        }
      }
    });
    
    if (!period) return null;
    
    // Check if session exists
    let session = await this.prisma.attendanceSession.findFirst({
      where: {
        date: today,
        periodId: period.id,
        assignedTeacherId: teacherId
      },
      include: {
        section: true,
        subject: true,
        assignedTeacher: {
          include: {
            staff: true
          }
        }
      }
    });
    
    if (!session) {
      // Create new session
      const { branchId } = PrismaService.getScope();
      session = await this.prisma.attendanceSession.create({
        data: {
          branchId,
          date: today,
          periodId: period.id,
          sectionId: period.sectionId,
          subjectId: period.subjectId,
          assignedTeacherId: teacherId,
          status: 'scheduled'
        },
        include: {
          section: true,
          subject: true,
          assignedTeacher: {
            include: {
              staff: true
            }
          }
        }
      });
    }
    
    return session;
  }

  // Get all today's sessions for a teacher
  async getTodaysSessions(teacherId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sessions = await this.prisma.attendanceSession.findMany({
      where: {
        date: today,
        OR: [
          { assignedTeacherId: teacherId },
          { actualTeacherId: teacherId }
        ]
      },
      include: {
        section: {
          include: {
            class: true
          }
        },
        subject: true,
        period: {
          include: {
            timeSlot: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });
    
    return sessions;
  }

  // Get student roster for a session
  async getSessionRoster(sessionId: string) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        section: {
          include: {
            enrollments: {
              where: { status: 'enrolled' },
              include: {
                student: true
              }
            }
          }
        },
        studentRecords: true
      }
    });
    
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    
    // Map students with their attendance status
    const roster = session.section.enrollments.map(enrollment => {
      const record = session.studentRecords.find(
        r => r.studentId === enrollment.studentId
      );
      
      return {
        studentId: enrollment.student.id,
        rollNumber: enrollment.student.rollNumber,
        firstName: enrollment.student.firstName,
        lastName: enrollment.student.lastName,
        photoUrl: enrollment.student.photoUrl,
        admissionNo: enrollment.student.admissionNo,
        status: record?.status || null,
        markedAt: record?.markedAt || null,
        minutesLate: record?.minutesLate || null,
        reason: record?.reason || null
      };
    });
    
    return {
      session,
      roster
    };
  }

  // Mark attendance for multiple students
  async markAttendance(
    sessionId: string,
    markings: Array<{
      studentId: string;
      status: string;
      minutesLate?: number;
      reason?: string;
      notes?: string;
    }>,
    teacherId: string
  ) {
    // Start transaction
    return this.prisma.$transaction(async (tx) => {
      // Update session status if not already in progress
      const session = await tx.attendanceSession.update({
        where: { id: sessionId },
        data: { 
          status: 'in-progress',
          startTime: new Date()
        }
      });
      
      // Delete existing records for this session (to handle updates)
      await tx.studentPeriodAttendance.deleteMany({
        where: {
          sessionId,
          studentId: {
            in: markings.map(m => m.studentId)
          }
        }
      });
      
      // Create new attendance records
      const records = markings.map(mark => ({
        sessionId,
        studentId: mark.studentId,
        status: mark.status,
        minutesLate: mark.minutesLate || null,
        reason: mark.reason || null,
        notes: mark.notes || null,
        markedAt: new Date(),
        markedBy: teacherId
      }));
      
      await tx.studentPeriodAttendance.createMany({
        data: records
      });
      
      return { 
        success: true, 
        marked: records.length,
        sessionId: session.id
      };
    });
  }

  // Mark individual student attendance
  async markStudentAttendance(
    sessionId: string,
    studentId: string,
    status: string,
    teacherId: string,
    details?: {
      minutesLate?: number;
      reason?: string;
      notes?: string;
    }
  ) {
    // Check if record exists
    const existing = await this.prisma.studentPeriodAttendance.findUnique({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId
        }
      }
    });
    
    if (existing) {
      // Update existing record
      return this.prisma.studentPeriodAttendance.update({
        where: {
          id: existing.id
        },
        data: {
          status,
          minutesLate: details?.minutesLate,
          reason: details?.reason,
          notes: details?.notes,
          markedAt: new Date(),
          markedBy: teacherId
        }
      });
    } else {
      // Create new record
      return this.prisma.studentPeriodAttendance.create({
        data: {
          sessionId,
          studentId,
          status,
          minutesLate: details?.minutesLate,
          reason: details?.reason,
          notes: details?.notes,
          markedAt: new Date(),
          markedBy: teacherId
        }
      });
    }
  }

  // Complete and lock session
  async completeSession(sessionId: string) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        studentRecords: true,
        section: {
          include: {
            enrollments: {
              where: { status: 'enrolled' }
            }
          }
        }
      }
    });
    
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    
    // Check if all students have been marked
    const totalStudents = session.section.enrollments.length;
    const markedStudents = session.studentRecords.length;
    
    if (markedStudents < totalStudents) {
      // Mark remaining students as absent
      const markedStudentIds = session.studentRecords.map(r => r.studentId);
      const unmarkedStudents = session.section.enrollments
        .filter(e => !markedStudentIds.includes(e.studentId))
        .map(e => e.studentId);
      
      await this.prisma.studentPeriodAttendance.createMany({
        data: unmarkedStudents.map(studentId => ({
          sessionId,
          studentId,
          status: 'absent',
          markedAt: new Date(),
          markedBy: session.assignedTeacherId
        }))
      });
    }
    
    // Lock the session
    return this.prisma.attendanceSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        endTime: new Date(),
        lockedAt: new Date()
      }
    });
  }

  // Get session by ID
  async getSession(sessionId: string) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        section: {
          include: {
            class: true
          }
        },
        subject: true,
        assignedTeacher: {
          include: {
            staff: true
          }
        },
        actualTeacher: {
          include: {
            staff: true
          }
        },
        period: {
          include: {
            timeSlot: true
          }
        },
        studentRecords: {
          include: {
            student: true
          }
        }
      }
    });
    
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    
    return session;
  }

  // List sessions with filters
  async listSessions(params: {
    date?: Date;
    teacherId?: string;
    sectionId?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize || 25));
    const skip = (page - 1) * pageSize;
    
    const where: any = {};
    const { branchId } = PrismaService.getScope();
    if (branchId) where.branchId = branchId;
    
    if (params.date) {
      const date = new Date(params.date);
      date.setHours(0, 0, 0, 0);
      where.date = date;
    }
    
    if (params.teacherId) {
      where.OR = [
        { assignedTeacherId: params.teacherId },
        { actualTeacherId: params.teacherId }
      ];
    }
    
    if (params.sectionId) where.sectionId = params.sectionId;
    if (params.status) where.status = params.status;
    
    const [data, total] = await Promise.all([
      this.prisma.attendanceSession.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          section: {
            include: {
              class: true
            }
          },
          subject: true,
          assignedTeacher: {
            include: {
              staff: true
            }
          },
          period: {
            include: {
              timeSlot: true
            }
          },
          _count: {
            select: {
              studentRecords: true
            }
          }
        },
        orderBy: [
          { date: 'desc' },
          { startTime: 'asc' }
        ]
      }),
      this.prisma.attendanceSession.count({ where })
    ]);
    
    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  async generateSessionsFromTimetable(date: Date, branchId?: string) {
    // Get the day of week (0=Sunday, 1=Monday, etc.)
    const dayOfWeek = date.getDay();
    
    // Get all timetable periods for this day and branch
    const periods = await this.prisma.timetablePeriod.findMany({
      where: {
        branchId,
        isActive: true,
        timeSlot: {
          dayOfWeek: dayOfWeek,
          slotType: 'regular', // Only regular periods, not breaks
        },
        effectiveFrom: { lte: date },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: date } },
        ],
      },
      include: {
        timeSlot: true,
        section: {
          include: {
            enrollments: {
              where: { status: 'enrolled' },
            },
          },
        },
        subject: true,
        teacher: true,
      },
    });

    if (periods.length === 0) {
      return { message: 'No timetable periods found for this date', generated: 0 };
    }

    // Check for existing sessions
    const existingSessions = await this.prisma.attendanceSession.findMany({
      where: {
        branchId,
        date: date,
        periodId: {
          in: periods.map(p => p.id),
        },
      },
      select: { periodId: true },
    });

    const existingPeriodIds = new Set(existingSessions.map(s => s.periodId));
    const periodsToProcess = periods.filter(p => !existingPeriodIds.has(p.id));

    if (periodsToProcess.length === 0) {
      return { 
        message: 'All timetable periods already have attendance sessions for this date', 
        generated: 0,
        date: date.toISOString().split('T')[0] 
      };
    }

    // Create attendance sessions
    const sessions = periodsToProcess.map(period => ({
      branchId,
      date: date,
      periodId: period.id,
      sectionId: period.sectionId,
      subjectId: period.subjectId,
      assignedTeacherId: period.teacherId,
      status: 'scheduled',
    }));

    const result = await this.prisma.attendanceSession.createMany({
      data: sessions,
    });

    return {
      message: 'Attendance sessions generated from timetable',
      date: date.toISOString().split('T')[0],
      generated: result.count,
      skipped: existingPeriodIds.size,
      totalPeriods: periods.length,
    };
  }

  async generateDummyAttendanceData(sessionId: string, presentPercentage: number = 85) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        section: {
          include: {
            enrollments: {
              where: { status: 'enrolled' },
              include: { student: true },
            },
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const students = session.section.enrollments.map(e => e.student);
    
    if (students.length === 0) {
      return { message: 'No enrolled students found for this section', generated: 0 };
    }

    // Check for existing attendance records
    const existingRecords = await this.prisma.studentPeriodAttendance.findMany({
      where: { sessionId },
      select: { studentId: true },
    });

    const existingStudentIds = new Set(existingRecords.map(r => r.studentId));
    const studentsToProcess = students.filter(s => !existingStudentIds.has(s.id));

    if (studentsToProcess.length === 0) {
      return { message: 'Attendance already marked for all students', generated: 0 };
    }

    // Generate realistic attendance data
    const attendanceRecords = studentsToProcess.map(student => {
      const random = Math.random() * 100;
      let status: string;
      let minutesLate: number | null = null;

      if (random < presentPercentage) {
        // Student is present or late
        const lateChance = Math.random() * 100;
        if (lateChance < 10) { // 10% chance of being late
          status = 'late';
          minutesLate = Math.floor(Math.random() * 30) + 5; // 5-35 minutes late
        } else {
          status = 'present';
        }
      } else {
        // Student is absent
        const excusedChance = Math.random() * 100;
        status = excusedChance < 30 ? 'excused' : 'absent'; // 30% of absences are excused
      }

      return {
        sessionId,
        studentId: student.id,
        status,
        minutesLate,
        markedAt: new Date(),
        markedBy: 'system-dummy-generator',
      };
    });

    // Insert attendance records and update session
    await this.prisma.$transaction(async (tx) => {
      // Create attendance records
      await tx.studentPeriodAttendance.createMany({
        data: attendanceRecords,
      });

      // Update session status
      await tx.attendanceSession.update({
        where: { id: sessionId },
        data: {
          status: 'completed',
          startTime: new Date(),
          endTime: new Date(),
          lockedAt: new Date(),
        },
      });
    });

    // Calculate statistics
    const stats = {
      present: attendanceRecords.filter(r => r.status === 'present').length,
      late: attendanceRecords.filter(r => r.status === 'late').length,
      absent: attendanceRecords.filter(r => r.status === 'absent').length,
      excused: attendanceRecords.filter(r => r.status === 'excused').length,
    };

    return {
      message: 'Dummy attendance data generated successfully',
      sessionId,
      generated: attendanceRecords.length,
      skipped: existingStudentIds.size,
      totalStudents: students.length,
      statistics: stats,
    };
  }
}