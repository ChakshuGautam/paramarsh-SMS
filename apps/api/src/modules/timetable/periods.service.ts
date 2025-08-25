<<<<<<< HEAD
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
=======
import { Injectable, NotFoundException } from '@nestjs/common';
>>>>>>> origin/main
import { PrismaService } from '../../prisma/prisma.service';
import { BaseCrudService } from '../../common/base-crud.service';
import { TimetablePeriod } from '@prisma/client';

@Injectable()
export class PeriodsService extends BaseCrudService<TimetablePeriod> {
  constructor(prisma: PrismaService) {
    super(prisma, 'timetablePeriod');
  }

  protected supportsBranchScoping(): boolean {
    return true;
  }

  protected buildSearchClause(search: string): any[] {
    return [
      { startTime: { contains: search } },
      { endTime: { contains: search } },
      { breakType: { contains: search } },
      { subject: { name: { contains: search } } },
      { teacher: { staff: { firstName: { contains: search } } } },
      { teacher: { staff: { lastName: { contains: search } } } },
      { section: { name: { contains: search } } },
      { room: { name: { contains: search } } },
    ];
  }

<<<<<<< HEAD
  // Override buildOrderBy to handle timetable-specific sorting
  protected buildOrderBy(sort?: string): any {
    if (!sort) {
      return { id: 'asc' };
    }

    // Handle multiple sort fields
    const sortFields = sort.split(',');
    return sortFields.map(field => {
      const isDesc = field.startsWith('-');
      const fieldName = isDesc ? field.slice(1) : field;
      const direction = isDesc ? 'desc' : 'asc';
      
      // Handle specific timetable sorting cases
      if (fieldName === 'class.gradeLevel') {
        return { section: { class: { gradeLevel: direction } } };
      }
      if (fieldName === 'class.name') {
        return { section: { class: { name: direction } } };
      }
      
      // Handle nested sorting generally
      if (fieldName.includes('.')) {
        const parts = fieldName.split('.');
        let orderByObj: any = { [parts[parts.length - 1]]: direction };
        
        for (let i = parts.length - 2; i >= 0; i--) {
          orderByObj = { [parts[i]]: orderByObj };
        }
        
        return orderByObj;
      }
      
      return { [fieldName]: direction };
    });
  }

  // Override getList to include relations
  async getList(params: any): Promise<{ data: TimetablePeriod[]; total: number }> {
    const page = Math.max(1, Number(params.page ?? 1));
    const perPage = Math.min(100, Math.max(1, Number(params.perPage ?? params.pageSize ?? 25)));
    const skip = (page - 1) * perPage;
=======
  // Override getList to include relations
  async getList(params: any): Promise<{ data: TimetablePeriod[]; total: number }> {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;
>>>>>>> origin/main

    const where = this.buildWhereClause(params.filter);
    const orderBy = this.buildOrderBy(params.sort);

    const [data, total] = await Promise.all([
      this.prisma.timetablePeriod.findMany({
        where,
        skip,
<<<<<<< HEAD
        take: perPage,
        orderBy,
        include: {
          section: {
            include: {
              class: true,
            },
          },
=======
        take: pageSize,
        orderBy,
        include: {
          section: true,
>>>>>>> origin/main
          subject: true,
          teacher: {
            include: {
              staff: true,
            },
          },
          room: true,
          academicYear: true,
        },
      }),
      this.prisma.timetablePeriod.count({ where }),
    ]);

    return { data, total };
  }

<<<<<<< HEAD
  // Override getMany to include relations
  async getMany(ids: string[]): Promise<{ data: TimetablePeriod[] }> {
    const data = await this.prisma.timetablePeriod.findMany({
      where: { id: { in: ids } },
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
        academicYear: true,
      },
    });

    return { data };
  }

=======
>>>>>>> origin/main
  // Override getOne to include relations
  async getOne(id: string): Promise<{ data: TimetablePeriod }> {
    const data = await this.prisma.timetablePeriod.findUnique({
      where: { id },
      include: {
<<<<<<< HEAD
        section: {
          include: {
            class: true,
          },
        },
=======
        section: true,
>>>>>>> origin/main
        subject: true,
        teacher: {
          include: {
            staff: true,
          },
        },
        room: true,
        academicYear: true,
      },
    });

    if (!data) {
      throw new NotFoundException('TimetablePeriod not found');
    }

    return { data };
  }

  // Custom method to find periods by branchId with pagination
  async findAll(params: {
    page: number;
<<<<<<< HEAD
    perPage?: number;
    pageSize?: number; // Keep for backward compatibility
=======
    pageSize: number;
>>>>>>> origin/main
    sort?: string;
    filter?: any;
    branchId: string;
  }): Promise<{ data: TimetablePeriod[]; total: number }> {
    const where = {
      ...this.buildWhereClause(params.filter),
      branchId: params.branchId,
    };

<<<<<<< HEAD
    const effectivePerPage = params.perPage || params.pageSize;
    return this.getList({
      page: params.page,
      perPage: effectivePerPage,
      sort: params.sort,
=======
    return this.getList({
      ...params,
>>>>>>> origin/main
      filter: { ...params.filter, branchId: params.branchId },
    });
  }

  // Custom method to find one by ID and branchId
  async findOne(id: string, branchId: string): Promise<TimetablePeriod> {
    const data = await this.prisma.timetablePeriod.findFirst({
      where: { 
        id,
        branchId,
      },
      include: {
<<<<<<< HEAD
        section: {
          include: {
            class: true,
          },
        },
=======
        section: true,
>>>>>>> origin/main
        subject: true,
        teacher: {
          include: {
            staff: true,
          },
        },
        room: true,
        academicYear: true,
      },
    });

    if (!data) {
      throw new NotFoundException('TimetablePeriod not found');
    }

    return data;
  }

  // Custom method to create with branchId
<<<<<<< HEAD
  async create(data: any) {
    try {
      const created = await this.prisma.timetablePeriod.create({
        data,
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
          academicYear: true,
        },
      });

      return { data: created };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Period already exists for this section, day, period number and academic year');
      }
      throw error;
    }
  }

  // Custom method to update with branchId validation
  async update(id: string, data: any) {
    // Get branchId from data or scope
    const branchId = data.branchId || PrismaService.getScope().branchId;
    
    // First verify the period exists and belongs to the branch
    await this.findOne(id, branchId);

    const updated = await this.prisma.timetablePeriod.update({
      where: { id },
      data,
      include: {
        section: {
          include: {
            class: true,
          },
        },
=======
  async create(data: any): Promise<TimetablePeriod> {
    const created = await this.prisma.timetablePeriod.create({
      data,
      include: {
        section: true,
>>>>>>> origin/main
        subject: true,
        teacher: {
          include: {
            staff: true,
          },
        },
        room: true,
        academicYear: true,
      },
    });

<<<<<<< HEAD
    return { data: updated };
=======
    return created;
  }

  // Custom method to update with branchId validation
  async update(id: string, data: any, branchId: string): Promise<TimetablePeriod> {
    // First verify the period exists and belongs to the branch
    await this.findOne(id, branchId);

    const updated = await this.prisma.timetablePeriod.update({
      where: { id },
      data,
      include: {
        section: true,
        subject: true,
        teacher: {
          include: {
            staff: true,
          },
        },
        room: true,
        academicYear: true,
      },
    });

    return updated;
>>>>>>> origin/main
  }

  // Custom method to remove with branchId validation
  async remove(id: string, branchId: string): Promise<TimetablePeriod> {
    // First verify the period exists and belongs to the branch
    await this.findOne(id, branchId);

    const deleted = await this.prisma.timetablePeriod.delete({
      where: { id },
      include: {
<<<<<<< HEAD
        section: {
          include: {
            class: true,
          },
        },
=======
        section: true,
>>>>>>> origin/main
        subject: true,
        teacher: {
          include: {
            staff: true,
          },
        },
        room: true,
        academicYear: true,
      },
    });

    return deleted;
  }
}