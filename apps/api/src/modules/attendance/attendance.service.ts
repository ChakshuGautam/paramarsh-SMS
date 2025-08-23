import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseCrudService } from '../../common/base-crud.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AttendanceService extends BaseCrudService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, 'attendanceRecord');
  }

  /**
   * AttendanceRecord model has branchId field for multi-tenancy support
   */
  protected supportsBranchScoping(): boolean {
    return true;
  }

  /**
   * Override to add branchId filtering and include student information
   */
  async getList(params: any) {
    try {
      const page = Math.max(1, Number(params.page ?? 1));
      const perPage = Math.min(100, Math.max(1, Number(params.perPage ?? 25)));
      const skip = (page - 1) * perPage;

      // Build where clause WITH BRANCH FILTERING
      const where: any = {};
      
      // CRITICAL: Add branchId filtering for multi-tenancy
      if (params.branchId) {
        where.branchId = params.branchId;
      }
      
      // Add filters correctly
      if (params.filter && typeof params.filter === 'object') {
        Object.keys(params.filter).forEach(key => {
          if (params.filter[key] !== undefined && params.filter[key] !== null) {
            where[key] = params.filter[key];
          }
        });
      }
      
      // Handle search query 'q'
      if (params.q && typeof params.q === 'string') {
        where.OR = [
          { status: { contains: params.q, mode: 'insensitive' } },
          { reason: { contains: params.q, mode: 'insensitive' } }
        ];
      }
      
      // Build orderBy for sorting
      let orderBy: any = [{ date: 'desc' }];
      if (params.sort) {
        let sortField: string;
        let sortOrder: 'asc' | 'desc';
        
        if (params.sort.includes(':')) {
          const [field, order] = params.sort.split(':');
          sortField = field;
          sortOrder = order === 'desc' ? 'desc' : 'asc';
        } else if (params.sort.startsWith('-')) {
          sortField = params.sort.slice(1);
          sortOrder = 'desc';
        } else {
          sortField = params.sort;
          sortOrder = 'asc';
        }
        
        orderBy = [{ [sortField]: sortOrder }];
      }

      const [data, total] = await Promise.all([
        this.prisma.attendanceRecord.findMany({ 
          where, 
          skip, 
          take: perPage,
          orderBy,
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                rollNumber: true,
                admissionNo: true
              }
            }
          }
        }),
        this.prisma.attendanceRecord.count({ where }),
      ]);

      return {
        data: data,
        total,
      };
    } catch (error) {
      console.error('Error in attendance getList:', error);
      throw error;
    }
  }

  /**
   * Override to add branchId filtering and include student information
   */
  async getOne(id: string, branchId?: string) {
    const data = await this.prisma.attendanceRecord.findFirst({
      where: { 
        id,
        ...(branchId && { branchId })
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rollNumber: true,
            admissionNo: true
          }
        }
      }
    });

    if (!data) {
      throw new NotFoundException('Attendance record not found');
    }

    return {
      data: data,
    };
  }

  /**
   * Override to add branchId filtering and include student information
   */
  async getMany(ids: string[], branchId?: string) {
    const data = await this.prisma.attendanceRecord.findMany({
      where: { 
        id: { in: ids },
        ...(branchId && { branchId })
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rollNumber: true,
            admissionNo: true
          }
        }
      }
    });

    return {
      data: data,
    };
  }

  /**
   * Override create method to ensure branchId is included
   */
  async create(data: any) {
    const result = await super.create(data);
    return {
      data: result.data,
    };
  }

  /**
   * Override update method
   */
  async update(id: string, data: any) {
    const result = await super.update(id, data);
    return {
      data: result.data,
    };
  }

  /**
   * Override delete method
   */
  async delete(id: string, userId?: string) {
    const result = await super.delete(id, userId);
    return {
      data: result.data,
    };
  }

  /**
   * Override to support search on status and reason
   */
  protected buildSearchClause(search: string): any[] {
    return [
      { status: { contains: search, mode: 'insensitive' } },
      { reason: { contains: search, mode: 'insensitive' } },
      { source: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Keep existing custom methods for backward compatibility
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