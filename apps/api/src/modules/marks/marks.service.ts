import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type Mark = {
  id?: string;
  studentId: string;
  sessionId: string;
  rawMarks?: number;
  grade?: string;
  comments?: string;
};

@Injectable()
export class MarksService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { page?: number; pageSize?: number; sort?: string; studentId?: string; sessionId?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.studentId) where.studentId = params.studentId;
    if (params.sessionId) where.sessionId = params.sessionId;
    const { branchId } = PrismaService.getScope();
    if (branchId) where.branchId = branchId;
    const orderBy: any = params.sort
      ? params.sort.split(',').map((f) => ({ [f.startsWith('-') ? f.slice(1) : f]: f.startsWith('-') ? 'desc' : 'asc' }))
      : [{ id: 'asc' }];

    const [data, total] = await Promise.all([
      this.prisma.marksEntry.findMany({ where, skip, take: pageSize, orderBy }),
      this.prisma.marksEntry.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, hasNext: skip + pageSize < total } };
  }

  async create(input: Mark) {
    const created = await this.prisma.marksEntry.create({ data: {
      studentId: input.studentId,
      sessionId: input.sessionId,
      rawMarks: input.rawMarks ?? null,
      grade: input.grade ?? null,
      comments: input.comments ?? null,
    }});
    return { data: created };
  }

  async update(id: string, input: Partial<Mark>) {
    const updated = await this.prisma.marksEntry.update({ where: { id }, data: {
      rawMarks: input.rawMarks ?? undefined,
      grade: input.grade ?? undefined,
      comments: input.comments ?? undefined,
    }});
    return { data: updated };
  }

  async remove(id: string) {
    try {
      await this.prisma.marksEntry.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Marks entry not found');
    }
    return { success: true };
  }
}
