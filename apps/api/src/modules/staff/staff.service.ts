import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type Staff = {
  branchId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  designation?: string;
  department?: string;
  employmentType?: string;
  joinDate?: string;
  status?: string;
};

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { 
    page?: number; 
    perPage?: number; 
    sort?: string; 
    filter?: string;
    ids?: string;
    department?: string; 
    status?: string;
    branchId?: string;
  }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.perPage ?? 25)));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    
    // Add branchId filtering for multi-tenancy
    if (params.branchId) {
      where.branchId = params.branchId;
    }

    // Handle specific IDs (for getMany)
    if (params.ids) {
      const idsArray = typeof params.ids === 'string' ? params.ids.split(',') : params.ids;
      where.id = { in: idsArray };
      // For getMany, return all matching without pagination
      const data = await this.prisma.staff.findMany({ where });
      return { data };
    }

    // Handle filter parameter (JSON string)
    if (params.filter) {
      try {
        const filter = JSON.parse(params.filter);
        Object.assign(where, filter);
      } catch (e) {
        // Ignore invalid JSON filter
      }
    }

    // Legacy individual filters
    if (params.department) where.department = params.department;
    if (params.status) where.status = params.status;

    // Handle sorting
    const orderBy: any = [];
    if (params.sort) {
      const sortField = params.sort.startsWith('-') ? params.sort.slice(1) : params.sort;
      const sortOrder = params.sort.startsWith('-') ? 'desc' : 'asc';
      orderBy.push({ [sortField]: sortOrder });
    } else {
      orderBy.push({ id: 'asc' });
    }

    const [data, total] = await Promise.all([
      this.prisma.staff.findMany({ where, skip, take: pageSize, orderBy }),
      this.prisma.staff.count({ where }),
    ]);
    return { data, total };
  }

  async create(input: Staff, branchId?: string) {
    const created = await this.prisma.staff.create({ data: {
      branchId: branchId || 'branch1', // Use provided branchId or fallback
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email ?? null,
      phone: input.phone ?? null,
      designation: input.designation ?? null,
      department: input.department ?? null,
      employmentType: input.employmentType ?? null,
      joinDate: input.joinDate ?? null,
      status: input.status ?? null,
    }});
    return { data: created };
  }

  async getOne(id: string, branchId?: string) {
    const where: any = { id };
    if (branchId) where.branchId = branchId;

    const data = await this.prisma.staff.findFirst({ where });
    if (!data) {
      throw new NotFoundException('Staff not found');
    }
    return { data };
  }

  async update(id: string, input: Partial<Staff>, branchId?: string) {
    const where: any = { id };
    if (branchId) where.branchId = branchId;

    // First check if record exists and belongs to tenant
    const existing = await this.prisma.staff.findFirst({ where });
    if (!existing) {
      throw new NotFoundException('Staff not found');
    }

    const updated = await this.prisma.staff.update({ 
      where: { id }, 
      data: {
        firstName: input.firstName ?? undefined,
        lastName: input.lastName ?? undefined,
        email: input.email ?? undefined,
        phone: input.phone ?? undefined,
        designation: input.designation ?? undefined,
        department: input.department ?? undefined,
        employmentType: input.employmentType ?? undefined,
        joinDate: input.joinDate ?? undefined,
        status: input.status ?? undefined,
      }
    });
    return { data: updated };
  }

  async remove(id: string, branchId?: string) {
    const where: any = { id };
    if (branchId) where.branchId = branchId;

    // First check if record exists and belongs to tenant
    const existing = await this.prisma.staff.findFirst({ where });
    if (!existing) {
      throw new NotFoundException('Staff not found');
    }

    const deleted = await this.prisma.staff.delete({ where: { id } });
    return { data: deleted };
  }
}
