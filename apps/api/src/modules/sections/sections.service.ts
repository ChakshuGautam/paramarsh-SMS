import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type Section = { id?: string; classId: string; name: string; capacity?: number };

@Injectable()
export class SectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { page?: number; pageSize?: number; sort?: string; classId?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.classId) where.classId = params.classId;
    const { branchId } = PrismaService.getScope();
    if (branchId) where.branchId = branchId;
    const orderBy: any = params.sort
      ? params.sort.split(',').map((f) => ({ [f.startsWith('-') ? f.slice(1) : f]: f.startsWith('-') ? 'desc' : 'asc' }))
      : [{ id: 'asc' }];

    const [data, total] = await Promise.all([
      this.prisma.section.findMany({ where, skip, take: pageSize, orderBy }),
      this.prisma.section.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, hasNext: skip + pageSize < total } };
  }

  async create(input: Section) {
    const created = await this.prisma.section.create({
      data: { classId: input.classId, name: input.name, capacity: input.capacity ?? null },
    });
    return { data: created };
  }

  async update(id: string, input: Partial<Section>) {
    const updated = await this.prisma.section.update({
      where: { id },
      data: {
        classId: input.classId ?? undefined,
        name: input.name ?? undefined,
        capacity: input.capacity ?? undefined,
      },
    });
    return { data: updated };
  }

  async remove(id: string) {
    try {
      await this.prisma.section.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Section not found');
    }
    return { success: true };
  }
}
