import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type Guardian = {
  id?: string;
  studentId: string;
  relation?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
};

@Injectable()
export class GuardiansService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { page?: number; pageSize?: number; sort?: string; studentId?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.studentId) where.studentId = params.studentId;
    const { branchId } = PrismaService.getScope();
    if (branchId) where.branchId = branchId;

    const orderBy: any = params.sort
      ? params.sort.split(',').map((f) => ({ [f.startsWith('-') ? f.slice(1) : f]: f.startsWith('-') ? 'desc' : 'asc' }))
      : [{ id: 'asc' }];

    const [data, total] = await Promise.all([
      this.prisma.guardian.findMany({ where, skip, take: pageSize, orderBy }),
      this.prisma.guardian.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, hasNext: skip + pageSize < total } };
  }

  async findOne(id: string) {
    const entity = await this.prisma.guardian.findUnique({
      where: { id },
    });
    if (!entity) {
      throw new NotFoundException('Guardian not found');
    }
    return { data: entity };
  }

  async create(input: Guardian) {
    const created = await this.prisma.guardian.create({
      data: {
        studentId: input.studentId,
        relation: input.relation ?? null,
        name: input.name,
        email: input.email ?? null,
        phone: input.phone ?? null,
        address: input.address ?? null,
      },
    });
    return { data: created };
  }

  async update(id: string, input: Partial<Guardian>) {
    const updated = await this.prisma.guardian.update({
      where: { id },
      data: {
        relation: input.relation ?? undefined,
        name: input.name ?? undefined,
        email: input.email ?? undefined,
        phone: input.phone ?? undefined,
        address: input.address ?? undefined,
      },
    });
    return { data: updated };
  }

  async remove(id: string) {
    const guardian = await this.prisma.guardian.findUnique({ where: { id } });
    if (!guardian) throw new NotFoundException('Guardian not found');
    const count = await this.prisma.guardian.count({ where: { studentId: guardian.studentId } });
    if (count <= 1) {
      throw new Error('Cannot delete the last guardian of a student');
    }
    await this.prisma.guardian.delete({ where: { id } });
    return { success: true };
  }
}
