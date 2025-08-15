import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type Attendance = {
  id?: string;
  studentId: string;
  date: string;
  status?: string;
  reason?: string;
  markedBy?: string;
  source?: string;
};

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { page?: number; pageSize?: number; sort?: string; studentId?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.studentId) where.studentId = params.studentId;
    const { branchId } = PrismaService.getScope();
    if (branchId) where.branchId = branchId;
    const orderBy: any = params.sort
      ? params.sort.split(',').map((f) => ({ [f.startsWith('-') ? f.slice(1) : f]: f.startsWith('-') ? 'desc' : 'asc' }))
      : [{ date: 'desc' }];

    const [data, total] = await Promise.all([
      this.prisma.attendanceRecord.findMany({ where, skip, take: pageSize, orderBy }),
      this.prisma.attendanceRecord.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, hasNext: skip + pageSize < total } };
  }

  async create(input: Attendance) {
    const created = await this.prisma.attendanceRecord.create({ data: {
      studentId: input.studentId,
      date: input.date,
      status: input.status ?? null,
      reason: input.reason ?? null,
      markedBy: input.markedBy ?? null,
      source: input.source ?? null,
    }});
    return { data: created };
  }

  async update(id: string, input: Partial<Attendance>) {
    const updated = await this.prisma.attendanceRecord.update({ where: { id }, data: {
      date: input.date ?? undefined,
      status: input.status ?? undefined,
      reason: input.reason ?? undefined,
      markedBy: input.markedBy ?? undefined,
      source: input.source ?? undefined,
    }});
    return { data: updated };
  }

  async remove(id: string) {
    try {
      await this.prisma.attendanceRecord.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Attendance record not found');
    }
    return { success: true };
  }

  async getStudentAttendanceSummary(studentId: string, startDate: string, endDate: string) {
    const { branchId } = PrismaService.getScope();
    
    // Get period-based attendance
    const periodAttendance = await this.prisma.studentPeriodAttendance.findMany({
      where: {
        studentId,
        session: {
          branchId,
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      },
      include: {
        session: {
          include: {
            period: {
              include: {
                timeSlot: true,
              },
            },
            subject: true,
          },
        },
      },
    });

    // Calculate statistics
    const stats = {
      totalPeriods: periodAttendance.length,
      present: periodAttendance.filter(a => a.status === 'present').length,
      absent: periodAttendance.filter(a => a.status === 'absent').length,
      late: periodAttendance.filter(a => a.status === 'late').length,
      excused: periodAttendance.filter(a => a.status === 'excused').length,
    };

    // Group by subject
    const bySubject = periodAttendance.reduce((acc, record) => {
      const subjectName = record.session.subject.name;
      if (!acc[subjectName]) {
        acc[subjectName] = {
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
        };
      }
      acc[subjectName].total++;
      if (record.status === 'present') acc[subjectName].present++;
      else if (record.status === 'absent') acc[subjectName].absent++;
      else if (record.status === 'late') acc[subjectName].late++;
      return acc;
    }, {} as Record<string, any>);

    return {
      stats,
      bySubject,
      details: periodAttendance,
    };
  }

  async getSectionAttendanceReport(sectionId: string, date: string) {
    const { branchId } = PrismaService.getScope();
    
    // Get all sessions for this section on this date
    const sessions = await this.prisma.attendanceSession.findMany({
      where: {
        branchId,
        sectionId,
        date: new Date(date),
      },
      include: {
        studentRecords: true,
        period: {
          include: {
            timeSlot: true,
          },
        },
        subject: true,
        assignedTeacher: {
          include: {
            staff: true,
          },
        },
      },
    });

    // Get all students in this section
    const students = await this.prisma.student.findMany({
      where: {
        branchId,
        enrollments: {
          some: {
            sectionId,
            status: 'enrolled',
          },
        },
      },
    });

    // Build attendance matrix
    const matrix = students.map(student => {
      const row: any = {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        rollNumber: student.rollNumber,
        periods: {},
      };

      sessions.forEach(session => {
        const record = session.studentRecords.find(r => r.studentId === student.id);
        row.periods[session.periodId] = {
          status: record?.status || 'not-marked',
          minutesLate: record?.minutesLate,
          markedAt: record?.markedAt,
        };
      });

      return row;
    });

    return {
      date,
      sectionId,
      sessions,
      students: matrix,
    };
  }

  async generateDummyAttendance(params: {
    date?: string;
    presentPercentage?: number;
    sickPercentage?: number;
    latePercentage?: number;
  }) {
    // Get today's date in ISO format if not provided
    const targetDate = params.date || new Date().toISOString().split('T')[0];
    
    // Default percentages
    const presentPct = params.presentPercentage ?? 85;
    const sickPct = params.sickPercentage ?? 20;
    const latePct = params.latePercentage ?? 10;

    // Get branch scope
    const { branchId } = PrismaService.getScope();
    if (!branchId) {
      throw new Error('Branch ID is required to generate attendance');
    }

    // Get all active students with enrollments
    const students = await this.prisma.student.findMany({
      where: {
        branchId,
        enrollments: {
          some: {
            status: 'enrolled',
            OR: [
              { endDate: null },
              { endDate: { gte: targetDate } }
            ]
          }
        }
      },
      include: {
        enrollments: {
          where: {
            status: 'enrolled',
            OR: [
              { endDate: null },
              { endDate: { gte: targetDate } }
            ]
          },
          take: 1
        }
      }
    });

    if (students.length === 0) {
      return { 
        message: 'No active students found', 
        generated: 0 
      };
    }

    // Check for existing attendance records for this date
    const existingRecords = await this.prisma.attendanceRecord.findMany({
      where: {
        branchId,
        date: targetDate,
        studentId: {
          in: students.map(s => s.id)
        }
      },
      select: { studentId: true }
    });

    const existingStudentIds = new Set(existingRecords.map(r => r.studentId));
    
    // Filter out students who already have attendance for this date
    const studentsToProcess = students.filter(s => !existingStudentIds.has(s.id));

    if (studentsToProcess.length === 0) {
      return { 
        message: 'All students already have attendance records for this date', 
        generated: 0,
        date: targetDate 
      };
    }

    // Generate attendance records
    const attendanceRecords = [];
    const reasons = [
      'Medical appointment',
      'Family emergency',
      'Transportation issue',
      'Weather conditions',
      'Personal reasons',
      'Doctor visit',
      'Fever',
      'Cold and flu',
      'Stomach ache',
      'Headache'
    ];

    for (const student of studentsToProcess) {
      const random = Math.random() * 100;
      let status: string;
      let reason: string | null = null;
      
      if (random < presentPct) {
        // Student is present or late
        const lateRandom = Math.random() * 100;
        status = lateRandom < latePct ? 'late' : 'present';
        if (status === 'late') {
          reason = 'Traffic delay';
        }
      } else {
        // Student is absent
        const sickRandom = Math.random() * 100;
        if (sickRandom < sickPct) {
          status = 'sick';
          reason = reasons[Math.floor(Math.random() * 5) + 5]; // Pick from sick reasons
        } else if (sickRandom < sickPct + 20) {
          status = 'excused';
          reason = reasons[Math.floor(Math.random() * 5)]; // Pick from excused reasons
        } else {
          status = 'absent';
          reason = null; // No reason for unexcused absence
        }
      }

      attendanceRecords.push({
        branchId,
        studentId: student.id,
        date: targetDate,
        status,
        reason,
        markedBy: 'system-dummy-generator',
        source: 'import'
      });
    }

    // Bulk insert attendance records
    const result = await this.prisma.attendanceRecord.createMany({
      data: attendanceRecords
    });

    // Calculate statistics
    const stats = {
      present: attendanceRecords.filter(r => r.status === 'present').length,
      late: attendanceRecords.filter(r => r.status === 'late').length,
      absent: attendanceRecords.filter(r => r.status === 'absent').length,
      sick: attendanceRecords.filter(r => r.status === 'sick').length,
      excused: attendanceRecords.filter(r => r.status === 'excused').length,
    };

    return {
      message: 'Dummy attendance generated successfully',
      date: targetDate,
      generated: result.count,
      skipped: existingStudentIds.size,
      totalStudents: students.length,
      statistics: stats
    };
  }
}
