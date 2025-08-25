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
    perPage?: number;
    sort?: string;
    q?: string;
    credits?: number;
    isElective?: boolean;
    code?: string;
    [key: string]: any;
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
    
    // isElective filter
    if (filters?.isElective !== undefined) {
      where.isElective = filters.isElective;
    }
    
    // Code filter
    if (filters?.code) {
      where.code = filters.code;
    }
    
    // Apply other dynamic filters
    Object.keys(filters || {}).forEach(key => {
      if (!['page', 'perPage', 'sort', 'q'].includes(key) && filters![key] !== undefined) {
        if (!(where as any)[key]) {
          (where as any)[key] = filters![key];
        }
      }
    });
    
    // Pagination
    const page = filters?.page || 1;
    const perPage = filters?.perPage || 10;
    const skip = (page - 1) * perPage;
    
    // Sorting - handle React Admin format
    let orderBy: Prisma.SubjectOrderByWithRelationInput = { name: 'asc' };
    if (filters?.sort) {
      const sortField = filters.sort.startsWith('-') ? filters.sort.substring(1) : filters.sort;
      const sortDirection = filters.sort.startsWith('-') ? 'desc' : 'asc';
      orderBy = { [sortField]: sortDirection };
    }
    
    const [subjects, total] = await Promise.all([
      this.prisma.subject.findMany({
        where,
        orderBy,
        skip,
        take: perPage,
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
      total,
    };
  }

  async findOne(id: string) {
    const { branchId } = PrismaService.getScope();
    const where: any = { id };
    if (branchId) where.branchId = branchId;
    
    return this.prisma.subject.findUnique({
      where,
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

  async findMany(ids: string[]) {
    const { branchId } = PrismaService.getScope();
    const where: any = { id: { in: ids } };
    if (branchId) where.branchId = branchId;

    const data = await this.prisma.subject.findMany({
      where,
      include: {
        constraints: true,
        periods: {
          take: 5,
          include: {
            section: true,
            teacher: true,
          },
        },
      },
    });

    return { data };
  }

  async update(id: string, data: Prisma.SubjectUpdateInput) {
    const { branchId } = PrismaService.getScope();
    const where: any = { id };
    if (branchId) where.branchId = branchId;
    
    return this.prisma.subject.update({
      where,
      data,
    });
  }

  async remove(id: string) {
    const { branchId } = PrismaService.getScope();
    const where: any = { id };
    if (branchId) where.branchId = branchId;
    
    return this.prisma.subject.delete({
      where,
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