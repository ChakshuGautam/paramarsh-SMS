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
   * Use the base class method with proper parameters
   */
  async getList(params: any) {
    // Set branch scoping in params
    const scopedParams = {
      page: params.page,
      perPage: params.perPage || params.pageSize,
      sort: params.sort,
      filter: {
        ...params.filter,
        branchId: params.branchId
      }
    };
    
    return super.getList(scopedParams);
  }

  /**
   * Use the base class method with branchId filtering
   */
  async getOne(id: string, branchId?: string) {
    const where: any = { id };
    if (branchId) {
      where.branchId = branchId;
    }
    
    const data = await this.prisma.attendanceRecord.findFirst({ where });
    
    if (!data) {
      throw new NotFoundException('AttendanceRecord not found');
    }
    
    return { data };
  }

  /**
   * Use the base class method with branchId filtering
   */
  async getMany(ids: string[], branchId?: string) {
    const where: any = { id: { in: ids } };
    if (branchId) {
      where.branchId = branchId;
    }
    
    const data = await this.prisma.attendanceRecord.findMany({ where });
    
    return { data };
  }

  /**
   * Create method - uses base class
   */
  async create(data: any) {
    return super.create(data);
  }

  /**
   * Update method with branchId validation
   */
  async update(id: string, data: any, branchId?: string) {
    // Validate record exists in this branch
    await this.getOne(id, branchId);
    
    const updated = await this.prisma.attendanceRecord.update({
      where: { id },
      data
    });
    
    return { data: updated };
  }

  /**
   * Delete method with branchId validation
   */
  async delete(id: string, userId?: string, branchId?: string) {
    // Validate record exists in this branch
    await this.getOne(id, branchId);
    
    const deleted = await this.prisma.attendanceRecord.delete({
      where: { id }
    });
    
    return { data: deleted };
  }

  /**
   * Override to support search on status and reason
   */
  protected buildSearchClause(search: string): any[] {
    return [
      { status: { contains: search } },
      { reason: { contains: search } },
      { source: { contains: search } },
    ];
  }

  /**
   * Override to handle date filtering correctly for string dates
   */
  protected buildWhereClause(filter?: Record<string, any>): any {
    const where = super.buildWhereClause(filter);
    
    // Handle date range filters specifically for string dates
    if (filter) {
      if (filter.date_gte) {
        where.date = { ...where.date, gte: filter.date_gte };
        delete where.date_gte;
      }
      if (filter.date_lte) {
        where.date = { ...where.date, lte: filter.date_lte };
        delete where.date_lte;
      }
    }
    
    return where;
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
                subject: true,
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
            subject: true,
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

  /**
   * Get dashboard statistics for attendance
   */
  async getDashboardStats(branchId: string, params: { 
    date?: string; 
    startDate?: string; 
    endDate?: string;
    classId?: string;
    sectionId?: string;
  }) {
    // Use today's date if not provided
    const targetDate = params.date || new Date().toISOString().split('T')[0];
    
    // Build student filter
    const studentFilter: any = {
      branchId,
      status: 'active',
      enrollments: {
        some: {
          status: 'enrolled',
          OR: [
            { endDate: null },
            { endDate: { gte: targetDate } }
          ]
        }
      }
    };
    
    // Add class and section filters if provided
    if (params.classId) {
      studentFilter.classId = params.classId;
    }
    if (params.sectionId) {
      studentFilter.sectionId = params.sectionId;
    }
    
    // Get total students with filters
    const totalStudents = await this.prisma.student.count({
      where: studentFilter
    });

    // Get attendance records for the date or date range
    let whereClause: any = { branchId };
    
    if (params.startDate && params.endDate) {
      whereClause.date = {
        gte: params.startDate,
        lte: params.endDate
      };
    } else {
      whereClause.date = targetDate;
    }
    
    // Add student filter for class/section if provided
    if (params.classId || params.sectionId) {
      whereClause.student = {};
      if (params.classId) {
        whereClause.student.classId = params.classId;
      }
      if (params.sectionId) {
        whereClause.student.sectionId = params.sectionId;
      }
    }

    const attendanceRecords = await this.prisma.attendanceRecord.findMany({
      where: whereClause,
      select: {
        status: true,
        date: true,
        studentId: true
      }
    });

    // Calculate statistics
    const statusCounts: Record<string, number> = {
      present: 0,
      absent: 0,
      late: 0,
      sick: 0,
      excused: 0
    };

    attendanceRecords.forEach(record => {
      statusCounts[record.status || 'absent']++;
    });

    // Calculate attendance percentage
    const presentCount = statusCounts.present + statusCounts.late;
    const attendancePercentage = totalStudents > 0 
      ? ((presentCount / totalStudents) * 100).toFixed(2) 
      : '0.00';

    // Get trends if date range provided
    let trends = null;
    if (params.startDate && params.endDate) {
      const dailyData = attendanceRecords.reduce((acc, record) => {
        if (!acc[record.date]) {
          acc[record.date] = {
            date: record.date,
            present: 0,
            absent: 0,
            late: 0,
            sick: 0,
            excused: 0
          };
        }
        acc[record.date][record.status || 'absent']++;
        return acc;
      }, {} as Record<string, any>);

      trends = Object.values(dailyData).sort((a: any, b: any) => 
        a.date.localeCompare(b.date)
      );
    }

    return {
      data: {
        date: targetDate,
        totalStudents,
        markedCount: attendanceRecords.length,
        unmarkedCount: totalStudents - (params.startDate && params.endDate ? 0 : attendanceRecords.length),
        statusCounts,
        attendancePercentage: parseFloat(attendancePercentage),
        trends
      }
    };
  }

  /**
   * Get class and section wise attendance summary
   */
  async getClassSectionSummary(branchId: string, date?: string) {
    // Use today's date if not provided
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Get all sections with their classes
    const sections = await this.prisma.section.findMany({
      where: { branchId },
      include: {
        class: true,
        enrollments: {
          where: {
            status: 'enrolled',
            OR: [
              { endDate: null },
              { endDate: { gte: targetDate } }
            ]
          },
          include: {
            student: true
          }
        }
      }
    });

    // Get attendance records for the date
    const attendanceRecords = await this.prisma.attendanceRecord.findMany({
      where: {
        branchId,
        date: targetDate
      },
      select: {
        studentId: true,
        status: true
      }
    });

    // Create a map of student attendance
    const attendanceMap = new Map(
      attendanceRecords.map(r => [r.studentId, r.status])
    );

    // Build summary for each section
    const summary = sections.map(section => {
      const students = section.enrollments.map(e => e.student);
      const totalStudents = students.length;
      
      const statusCounts: Record<string, number> = {
        present: 0,
        absent: 0,
        late: 0,
        sick: 0,
        excused: 0,
        unmarked: 0
      };

      students.forEach(student => {
        const status = attendanceMap.get(student.id);
        if (status) {
          statusCounts[status]++;
        } else {
          statusCounts.unmarked++;
        }
      });

      const presentCount = statusCounts.present + statusCounts.late;
      const attendancePercentage = totalStudents > 0 
        ? ((presentCount / totalStudents) * 100).toFixed(2)
        : '0.00';

      return {
        classId: section.classId,
        className: section.class.name,
        sectionId: section.id,
        sectionName: section.name,
        totalStudents,
        statusCounts,
        attendancePercentage: parseFloat(attendancePercentage)
      };
    });

    // Group by class
    const byClass = summary.reduce((acc, item) => {
      if (!acc[item.classId]) {
        acc[item.classId] = {
          classId: item.classId,
          className: item.className,
          sections: [],
          totalStudents: 0,
          overallAttendance: 0
        };
      }
      
      acc[item.classId].sections.push(item);
      acc[item.classId].totalStudents += item.totalStudents;
      
      return acc;
    }, {} as Record<string, any>);

    // Calculate overall attendance for each class
    Object.values(byClass).forEach((classData: any) => {
      const totalPresent = classData.sections.reduce((sum: number, section: any) => 
        sum + section.statusCounts.present + section.statusCounts.late, 0
      );
      classData.overallAttendance = classData.totalStudents > 0
        ? ((totalPresent / classData.totalStudents) * 100).toFixed(2)
        : '0.00';
      classData.overallAttendance = parseFloat(classData.overallAttendance);
    });

    return {
      data: {
        date: targetDate,
        summary,
        byClass: Object.values(byClass)
      }
    };
  }

  /**
   * Get attendance trends over time
   */
  async getAttendanceTrends(branchId: string, days: number = 30, granularity: 'daily' | 'weekly' | 'monthly' = 'daily') {
    // Calculate date range
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get attendance records for the date range
    const attendanceRecords = await this.prisma.attendanceRecord.findMany({
      where: {
        branchId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        date: true,
        status: true,
        studentId: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Get total students for percentage calculations
    const totalStudents = await this.prisma.student.count({
      where: {
        branchId,
        status: 'active'
      }
    });

    // Group data based on granularity
    const groupedData: Record<string, any> = {};

    attendanceRecords.forEach(record => {
      let key: string;
      
      if (granularity === 'daily') {
        key = record.date;
      } else if (granularity === 'weekly') {
        const weekStart = this.getWeekStart(new Date(record.date));
        key = weekStart.toISOString().split('T')[0];
      } else {
        // monthly
        const date = new Date(record.date);
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!groupedData[key]) {
        groupedData[key] = {
          period: key,
          present: 0,
          absent: 0,
          late: 0,
          sick: 0,
          excused: 0,
          total: 0
        };
      }

      groupedData[key][record.status || 'absent']++;
      groupedData[key].total++;
    });

    // Convert to array and calculate percentages
    const trends = Object.values(groupedData).map((item: any) => {
      const presentCount = item.present + item.late;
      const attendanceRate = item.total > 0 
        ? ((presentCount / item.total) * 100).toFixed(2)
        : '0.00';

      return {
        ...item,
        attendanceRate: parseFloat(attendanceRate),
        averageStudents: Math.round(item.total / (granularity === 'monthly' ? 20 : granularity === 'weekly' ? 5 : 1))
      };
    });

    // Calculate overall statistics
    const overallStats = {
      totalRecords: attendanceRecords.length,
      averageAttendanceRate: trends.length > 0
        ? (trends.reduce((sum, t) => sum + t.attendanceRate, 0) / trends.length).toFixed(2)
        : '0.00',
      highestAttendance: trends.length > 0
        ? Math.max(...trends.map(t => t.attendanceRate))
        : 0,
      lowestAttendance: trends.length > 0
        ? Math.min(...trends.map(t => t.attendanceRate))
        : 0
    };

    return {
      data: {
        startDate,
        endDate,
        days,
        granularity,
        totalStudents,
        trends,
        overallStats
      }
    };
  }

  /**
   * Helper function to get the start of the week
   */
  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    return new Date(d.setDate(diff));
  }
}