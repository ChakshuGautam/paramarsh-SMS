import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type ClassRow = { name: string; gradeLevel?: number };

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { page?: number; pageSize?: number; sort?: string; q?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.q) where.name = { contains: params.q, mode: 'insensitive' };
    const { branchId } = PrismaService.getScope();
    if (branchId) where.branchId = branchId;
    const orderBy: any = params.sort
      ? params.sort.split(',').map((f) => ({ [f.startsWith('-') ? f.slice(1) : f]: f.startsWith('-') ? 'desc' : 'asc' }))
      : [{ id: 'asc' }];

    const [data, total] = await Promise.all([
      this.prisma.class.findMany({ where, skip, take: pageSize, orderBy }),
      this.prisma.class.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, hasNext: skip + pageSize < total } };
  }

  async create(input: { name: string; gradeLevel?: number }) {
    const created = await this.prisma.class.create({ data: { name: input.name, gradeLevel: input.gradeLevel ?? null } });
    return { data: created };
  }

  async update(id: string, input: { name?: string; gradeLevel?: number }) {
    const updated = await this.prisma.class.update({ where: { id }, data: { name: input.name ?? undefined, gradeLevel: input.gradeLevel ?? undefined } });
    return { data: updated };
  }

  async remove(id: string) {
    try {
      await this.prisma.class.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Class not found');
    }
    return { success: true };
  }
}
