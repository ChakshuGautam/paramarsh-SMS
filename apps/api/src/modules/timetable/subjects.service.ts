import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.SubjectCreateInput) {
    const { branchId } = PrismaService.getScope();
    return this.prisma.subject.create({ 
      data: {
        ...data,
        branchId: branchId ?? undefined,
      }
    });
  }

  async findAll(filters?: {
    page?: number;
    pageSize?: number;
    sort?: string;
    q?: string;
    credits?: number;
    isActive?: boolean;
  }) {
    const { branchId } = PrismaService.getScope();
    const where: Prisma.SubjectWhereInput = {};
    if (branchId) where.branchId = branchId;
    
    // Search filter
    if (filters?.q) {
      where.OR = [
        { name: { contains: filters.q } },
        { code: { contains: filters.q } },
      ];
    }
    
    // Credits filter
    if (filters?.credits !== undefined) {
      where.credits = filters.credits;
    }
    
    // Elective filter (using isElective since isActive doesn't exist)
    if (filters?.isActive !== undefined) {
      where.isElective = filters.isActive; // Map isActive to isElective for now
    }
    
    // Pagination
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 10;
    const skip = (page - 1) * pageSize;
    
    // Sorting
    let orderBy: Prisma.SubjectOrderByWithRelationInput = { name: 'asc' };
    if (filters?.sort) {
      const [field, direction] = filters.sort.split(':');
      if (field && direction) {
        orderBy = { [field]: direction === 'desc' ? 'desc' : 'asc' };
      }
    }
    
    const [subjects, total] = await Promise.all([
      this.prisma.subject.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          constraints: true,
          periods: {
            where: { isActive: true },
            include: {
              section: true,
              teacher: true,
              timeSlot: true,
            },
          },
        },
      }),
      this.prisma.subject.count({ where }),
    ]);
    
    return {
      data: subjects,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.subject.findUnique({
      where: { id },
      include: {
        constraints: true,
        periods: {
          include: {
            section: {
              include: { class: true },
            },
            teacher: {
              include: { staff: true },
            },
            timeSlot: true,
            room: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.SubjectUpdateInput) {
    return this.prisma.subject.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.subject.delete({
      where: { id },
    });
  }

  async addConstraint(subjectId: string, constraint: {
    type: string;
    value: string;
    priority?: number;
  }) {
    return this.prisma.subjectConstraint.create({
      data: {
        subjectId,
        ...constraint,
      },
    });
  }

  async getSubjectsByClass(classId: string) {
    return this.prisma.subject.findMany({
      where: {
        periods: {
          some: {
            section: {
              classId,
            },
            isActive: true,
          },
        },
      },
    });
  }

  async getSubjectLoad(subjectId: string) {
    const periods = await this.prisma.timetablePeriod.findMany({
      where: {
        subjectId,
        isActive: true,
      },
      include: {
        section: {
          include: { class: true },
        },
        timeSlot: true,
      },
    });

    const loadByClass = periods.reduce((acc, period) => {
      const className = period.section.class.name;
      if (!acc[className]) {
        acc[className] = {
          className,
          periodsPerWeek: 0,
          sections: new Set(),
        };
      }
      acc[className].periodsPerWeek++;
      acc[className].sections.add(period.section.name);
      return acc;
    }, {} as Record<string, any>);

    return Object.values(loadByClass).map((load: any) => ({
      ...load,
      sections: Array.from(load.sections),
    }));
  }
}