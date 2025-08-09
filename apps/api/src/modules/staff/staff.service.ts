import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type Staff = {
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

  async list(params: { page?: number; pageSize?: number; sort?: string; department?: string; status?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.department) where.department = params.department;
    if (params.status) where.status = params.status;
    const { branchId } = PrismaService.getScope();
    if (branchId) where.branchId = branchId;

    const orderBy: any = params.sort
      ? params.sort.split(',').map((f) => ({ [f.startsWith('-') ? f.slice(1) : f]: f.startsWith('-') ? 'desc' : 'asc' }))
      : [{ id: 'asc' }];

    const [data, total] = await Promise.all([
      this.prisma.staff.findMany({ where, skip, take: pageSize, orderBy }),
      this.prisma.staff.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, hasNext: skip + pageSize < total } };
  }

  async create(input: Staff) {
    const created = await this.prisma.staff.create({ data: {
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

  async update(id: string, input: Partial<Staff>) {
    const updated = await this.prisma.staff.update({ where: { id }, data: {
      firstName: input.firstName ?? undefined,
      lastName: input.lastName ?? undefined,
      email: input.email ?? undefined,
      phone: input.phone ?? undefined,
      designation: input.designation ?? undefined,
      department: input.department ?? undefined,
      employmentType: input.employmentType ?? undefined,
      joinDate: input.joinDate ?? undefined,
      status: input.status ?? undefined,
    }});
    return { data: updated };
  }

  async remove(id: string) {
    try {
      await this.prisma.staff.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Staff not found');
    }
    return { success: true };
  }
}
