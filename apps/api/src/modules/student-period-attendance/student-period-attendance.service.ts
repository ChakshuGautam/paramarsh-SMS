import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseCrudService } from '../../common/base-crud.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StudentPeriodAttendanceService extends BaseCrudService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, 'studentPeriodAttendance');
  }

  /**
   * StudentPeriodAttendance model doesn't have branchId directly, 
   * but uses session relation for branch scoping
   */
  protected supportsBranchScoping(): boolean {
    return false; // Handle branch scoping manually through session
  }

  /**
   * Override getList to handle branch scoping through session relation
   */
  async getList(params: any) {
    // Build proper parameters for BaseCrudService
    const serviceParams = {
      page: Math.max(1, Number(params.page ?? 1)),
      perPage: Math.min(100, Math.max(1, Number(params.perPage ?? 25))),
      sort: params.sort,
      filter: { ...params.filter }
    };

    // Handle search query 'q' by adding to filter
    if (params.q && typeof params.q === 'string') {
      serviceParams.filter.q = params.q;
    }

    // Add branchId filtering through session relation
    if (params.branchId) {
      serviceParams.filter.session = {
        branchId: params.branchId
      };
    }

    // Use base service method with custom includes
    const result = await super.getList(serviceParams);
    
    // Add includes for related data
    if (result.data && result.data.length > 0) {
      const ids = result.data.map((item: any) => item.id);
      const dataWithIncludes = await this.prisma.studentPeriodAttendance.findMany({
        where: { id: { in: ids } },
        include: {
          student: true,
          session: {
            include: {
              period: {
                include: {
                  subject: true
                }
              },
              subject: true,
              section: {
                include: {
                  class: true
                }
              }
            }
          },
          marker: {
            include: {
              staff: true
            }
          }
        },
        orderBy: this.buildOrderBy(params.sort)
      });
      
      return { data: dataWithIncludes, total: result.total };
    }

    return result;
  }

  /**
   * Override getOne to add branchId filtering through session
   */
  async getOne(id: string, branchId?: string) {
    const where: any = { id };
    
    // Add branch filtering through session relation
    if (branchId) {
      where.session = {
        branchId: branchId
      };
    }
    
    const data = await this.prisma.studentPeriodAttendance.findFirst({
      where,
      include: {
        student: true,
        session: {
          include: {
            period: {
              include: {
                subject: true
              }
            },
            subject: true,
            section: {
              include: {
                class: true
              }
            }
          }
        },
        marker: {
          include: {
            staff: true
          }
        }
      }
    });

    if (!data) {
      throw new NotFoundException('StudentPeriodAttendance not found');
    }

    return { data };
  }

  /**
   * Override getMany to add branchId filtering through session
   */
  async getMany(ids: string[], branchId?: string) {
    const where: any = { id: { in: ids } };
    
    // Add branch filtering through session relation
    if (branchId) {
      where.session = {
        branchId: branchId
      };
    }
    
    const data = await this.prisma.studentPeriodAttendance.findMany({
      where,
      include: {
        student: true,
        session: {
          include: {
            period: {
              include: {
                subject: true
              }
            },
            subject: true,
            section: {
              include: {
                class: true
              }
            }
          }
        },
        marker: {
          include: {
            staff: true
          }
        }
      }
    });

    return { data };
  }

  /**
   * Create method with proper data handling
   */
  async create(data: any) {
    // Set markedAt to current time if not provided
    if (!data.markedAt) {
      data.markedAt = new Date();
    }
    
    return super.create(data);
  }

  /**
   * Update method with branchId validation through session
   */
  async update(id: string, data: any, branchId?: string) {
    // Verify entity exists in this branch before updating
    await this.getOne(id, branchId);
    
    const updated = await this.prisma.studentPeriodAttendance.update({
      where: { id },
      data
    });
    
    return { data: updated };
  }

  /**
   * Delete method with branchId validation through session
   */
  async delete(id: string, userId?: string, branchId?: string) {
    // Verify entity exists in this branch before deleting
    await this.getOne(id, branchId);
    
    const deleted = await this.prisma.studentPeriodAttendance.delete({
      where: { id }
    });
    
    return { data: deleted };
  }

  /**
   * Override to support search on status, reason, and notes
   */
  protected buildSearchClause(search: string): any[] {
    return [
      { status: { contains: search, mode: 'insensitive' } },
      { reason: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
      // Search in related student name
      { 
        student: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { rollNumber: { contains: search, mode: 'insensitive' } }
          ]
        }
      },
      // Search in subject name through session
      {
        session: {
          subject: {
            name: { contains: search, mode: 'insensitive' }
          }
        }
      }
    ];
  }

  /**
   * Override buildWhereClause to handle session-based filtering
   */
  protected buildWhereClause(filter?: Record<string, any>): any {
    const where = super.buildWhereClause(filter);
    
    // Handle specific filters
    if (filter) {
      // Direct sessionId filter
      if (filter.sessionId) {
        where.sessionId = filter.sessionId;
        delete where.sessionId; // Remove from where to avoid duplication
      }
      
      // Direct studentId filter
      if (filter.studentId) {
        where.studentId = filter.studentId;
      }
      
      // Status filter
      if (filter.status) {
        where.status = filter.status;
      }
      
      // Date range filters through session
      if (filter.date_gte || filter.date_lte) {
        if (!where.session) where.session = {};
        if (filter.date_gte) {
          where.session.date = { ...where.session.date, gte: new Date(filter.date_gte) };
        }
        if (filter.date_lte) {
          where.session.date = { ...where.session.date, lte: new Date(filter.date_lte) };
        }
      }
      
      // Section filter through session
      if (filter.sectionId) {
        if (!where.session) where.session = {};
        where.session.sectionId = filter.sectionId;
      }
      
      // Subject filter through session
      if (filter.subjectId) {
        if (!where.session) where.session = {};
        where.session.subjectId = filter.subjectId;
      }
      
      // Period filter through session
      if (filter.periodId) {
        if (!where.session) where.session = {};
        where.session.periodId = filter.periodId;
      }
      
      // Teacher/marker filter
      if (filter.markedBy) {
        where.markedBy = filter.markedBy;
      }
    }
    
    return where;
  }

  /**
   * Get attendance summary for a student across periods
   */
  async getStudentSummary(studentId: string, startDate?: string, endDate?: string, branchId?: string) {
    const where: any = { 
      studentId,
      session: branchId ? { branchId } : undefined
    };
    
    if (startDate || endDate) {
      if (!where.session) where.session = {};
      where.session.date = {};
      if (startDate) where.session.date.gte = new Date(startDate);
      if (endDate) where.session.date.lte = new Date(endDate);
    }
    
    const records = await this.prisma.studentPeriodAttendance.findMany({
      where,
      include: {
        session: {
          include: {
            period: true,
            subject: true
          }
        }
      }
    });
    
    // Calculate statistics
    const stats = {
      totalPeriods: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      excused: records.filter(r => r.status === 'excused').length,
    };
    
    // Calculate attendance percentage
    const attendancePercentage = stats.totalPeriods > 0 
      ? ((stats.present + stats.late) / stats.totalPeriods * 100).toFixed(2)
      : '0.00';
    
    // Group by subject
    const bySubject: Record<string, any> = {};
    records.forEach(record => {
      const subjectName = record.session.subject.name;
      if (!bySubject[subjectName]) {
        bySubject[subjectName] = {
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0
        };
      }
      bySubject[subjectName].total++;
      bySubject[subjectName][record.status]++;
    });
    
    return {
      data: {
        studentId,
        period: { startDate, endDate },
        stats: {
          ...stats,
          attendancePercentage: parseFloat(attendancePercentage)
        },
        bySubject,
        totalRecords: records.length
      }
    };
  }

  /**
   * Get attendance report for a session
   */
  async getSessionReport(sessionId: string, branchId?: string) {
    // Verify session exists in the branch
    const session = await this.prisma.attendanceSession.findFirst({
      where: {
        id: sessionId,
        ...(branchId && { branchId })
      },
      include: {
        period: {
          include: {
            subject: true
          }
        },
        subject: true,
        section: {
          include: {
            class: true
          }
        }
      }
    });
    
    if (!session) {
      throw new NotFoundException('AttendanceSession not found');
    }
    
    // Get attendance records for this session
    const records = await this.prisma.studentPeriodAttendance.findMany({
      where: { sessionId },
      include: {
        student: true,
        marker: {
          include: {
            staff: true
          }
        }
      },
      orderBy: {
        student: {
          rollNumber: 'asc'
        }
      }
    });
    
    // Calculate statistics
    const stats = {
      totalRecords: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      excused: records.filter(r => r.status === 'excused').length,
    };
    
    return {
      data: {
        session,
        records,
        stats
      }
    };
  }
}