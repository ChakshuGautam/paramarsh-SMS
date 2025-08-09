import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type Exam = { id?: string; name: string; startDate?: string; endDate?: string };

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { page?: number; pageSize?: number; sort?: string; q?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.q) where.name = { contains: params.q, mode: 'insensitive' };
    const orderBy: any = params.sort
      ? params.sort.split(',').map((f) => ({ [f.startsWith('-') ? f.slice(1) : f]: f.startsWith('-') ? 'desc' : 'asc' }))
      : [{ id: 'asc' }];

    const [data, total] = await Promise.all([
      this.prisma.exam.findMany({ where, skip, take: pageSize, orderBy }),
      this.prisma.exam.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, hasNext: skip + pageSize < total } };
  }

  async create(input: Exam) {
    const created = await this.prisma.exam.create({ data: { name: input.name, startDate: input.startDate ?? null, endDate: input.endDate ?? null } });
    return { data: created };
  }

  async update(id: string, input: Partial<Exam>) {
    const updated = await this.prisma.exam.update({ where: { id }, data: { name: input.name ?? undefined, startDate: input.startDate ?? undefined, endDate: input.endDate ?? undefined } });
    return { data: updated };
  }

  async remove(id: string) {
    try {
      await this.prisma.exam.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Exam not found');
    }
    return { success: true };
  }
}
