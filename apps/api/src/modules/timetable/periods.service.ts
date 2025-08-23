import { Injectable, NotFoundException } from '@nestjs/common';
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

  // Override getList to include relations
  async getList(params: any): Promise<{ data: TimetablePeriod[]; total: number }> {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    const where = this.buildWhereClause(params.filter);
    const orderBy = this.buildOrderBy(params.sort);

    const [data, total] = await Promise.all([
      this.prisma.timetablePeriod.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
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
      }),
      this.prisma.timetablePeriod.count({ where }),
    ]);

    return { data, total };
  }

  // Override getOne to include relations
  async getOne(id: string): Promise<{ data: TimetablePeriod }> {
    const data = await this.prisma.timetablePeriod.findUnique({
      where: { id },
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

    if (!data) {
      throw new NotFoundException('TimetablePeriod not found');
    }

    return { data };
  }

  // Custom method to find periods by branchId with pagination
  async findAll(params: {
    page: number;
    pageSize: number;
    sort?: string;
    filter?: any;
    branchId: string;
  }): Promise<{ data: TimetablePeriod[]; total: number }> {
    const where = {
      ...this.buildWhereClause(params.filter),
      branchId: params.branchId,
    };

    return this.getList({
      ...params,
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

    if (!data) {
      throw new NotFoundException('TimetablePeriod not found');
    }

    return data;
  }

  // Custom method to create with branchId
  async create(data: any): Promise<TimetablePeriod> {
    const created = await this.prisma.timetablePeriod.create({
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
  }

  // Custom method to remove with branchId validation
  async remove(id: string, branchId: string): Promise<TimetablePeriod> {
    // First verify the period exists and belongs to the branch
    await this.findOne(id, branchId);

    const deleted = await this.prisma.timetablePeriod.delete({
      where: { id },
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

    return deleted;
  }
}