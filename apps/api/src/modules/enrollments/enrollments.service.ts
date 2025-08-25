import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type Enrollment = {
  studentAdmissionNo: string;
  className: string;
  sectionName: string;
  status?: string;
  startDate?: string;
  endDate?: string;
};

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: any) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.perPage ?? params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    
    // For multi-tenancy, filter via section.branchId instead of direct branchId
    // since Enrollment doesn't have a direct branchId column in all environments
    
    // Legacy field filters
    if (params.sectionId) where.sectionId = params.sectionId;
    if (params.studentId) where.studentId = params.studentId;
    // Map 'active' to 'enrolled' for backward compatibility
    if (params.status) {
      where.status = params.status === 'active' ? 'enrolled' : params.status;
    }
    
    // Date filters
    if (params.startDateGte) {
      where.startDate = { ...where.startDate, gte: new Date(params.startDateGte) };
    }
    if (params.endDateLte) {
      where.endDate = { ...where.endDate, lte: new Date(params.endDateLte) };
    }
    
    // Standard filter object
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
        { student: { firstName: { contains: params.q, mode: 'insensitive' } } },
        { student: { lastName: { contains: params.q, mode: 'insensitive' } } },
        { student: { admissionNo: { contains: params.q, mode: 'insensitive' } } },
      ];
    }

    // Build orderBy for sorting  
    let orderBy: any = undefined;
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
      
      // Handle nested field sorting (e.g., student.rollNumber)
      if (sortField.includes('.')) {
        const parts = sortField.split('.');
        if (parts[0] === 'student' && parts[1]) {
          orderBy = { student: { [parts[1]]: sortOrder } };
        } else if (parts[0] === 'section' && parts[1]) {
          orderBy = { section: { [parts[1]]: sortOrder } };
        } else {
          orderBy = { [sortField]: sortOrder };
        }
      } else {
        orderBy = { [sortField]: sortOrder };
      }
    } else {
      orderBy = { id: 'asc' };
    }

    const [data, total] = await Promise.all([
      this.prisma.enrollment.findMany({ 
        where, 
        skip, 
        take: pageSize, 
        orderBy,
        include: {
          student: true,
          section: {
            include: {
              class: true
            }
          }
        }
      }),
      this.prisma.enrollment.count({ where }),
    ]);
    return { data, total };
  }

  async getOne(id: string, branchId?: string) {
    const enrollment = await this.prisma.enrollment.findFirst({ 
      where: { 
        id
        // Branch filtering handled via section relationship
      },
      include: {
        student: true,
        section: {
          include: {
            class: true
          }
        }
      }
    });
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }
    return { data: enrollment };
  }

  async getMany(ids: string[], branchId?: string) {
    const data = await this.prisma.enrollment.findMany({
      where: { 
        id: { in: ids }
        // Branch filtering handled via section relationship
      },
      include: {
        student: true,
        section: {
          include: {
            class: true
          }
        }
      }
    });

    return { data };
  }

  async create(input: any) {
    const created = await this.prisma.$transaction(async (tx) => {
      // Close any active enrollment
      await tx.enrollment.updateMany({ 
        where: { studentId: input.studentId, endDate: null }, 
        data: { 
          endDate: input.startDate ?? new Date().toISOString().slice(0, 10), 
          status: 'transferred' 
        } 
      });
      // Create new enrollment
      const enr = await tx.enrollment.create({ 
        data: {
          studentId: input.studentId,
          sectionId: input.sectionId,
          status: input.status ?? 'enrolled',
          startDate: input.startDate ?? new Date().toISOString().slice(0, 10),
          endDate: input.endDate ?? null,
        },
        include: {
          student: true,
          section: {
            include: {
              class: true
            }
          }
        }
      });
      // Update student's current section/class from section
      const section = await tx.section.findUnique({ where: { id: input.sectionId } });
      if (section) {
        await tx.student.update({ 
          where: { id: input.studentId }, 
          data: { sectionId: section.id, classId: section.classId } 
        });
      }
      return enr;
    });
    return { data: created };
  }

  async update(id: string, input: any) {
    const updated = await this.prisma.enrollment.update({ 
      where: { id }, 
      data: {
        sectionId: input.sectionId ?? undefined,
        status: input.status ?? undefined,
        startDate: input.startDate ?? undefined,
        endDate: input.endDate ?? undefined,
      },
      include: {
        student: true,
        section: {
          include: {
            class: true
          }
        }
      }
    });
    return { data: updated };
  }

  async remove(id: string, branchId?: string) {
    try {
      const result = await this.prisma.enrollment.delete({ 
        where: { id },
        include: {
          student: true,
          section: {
            include: {
              class: true
            }
          }
        }
      });
      return { data: result };
    } catch {
      throw new NotFoundException('Enrollment not found');
    }
  }
}
