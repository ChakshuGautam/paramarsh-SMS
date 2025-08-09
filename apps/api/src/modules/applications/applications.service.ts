import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type Application = {
  id?: string;
  tenantId?: string;
  programId?: string;
  studentProfileRef?: string;
  status?: string;
  score?: number;
  priorityTag?: string;
  createdAt?: string;
};

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { page?: number; pageSize?: number; sort?: string; status?: string; tenantId?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.tenantId) where.tenantId = params.tenantId;
    const orderBy: any = params.sort
      ? params.sort.split(',').map((f) => ({ [f.startsWith('-') ? f.slice(1) : f]: f.startsWith('-') ? 'desc' : 'asc' }))
      : [{ id: 'asc' }];

    const [data, total] = await Promise.all([
      this.prisma.application.findMany({ where, skip, take: pageSize, orderBy }),
      this.prisma.application.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, hasNext: skip + pageSize < total } };
  }

  async create(input: Partial<Application>) {
    const created = await this.prisma.application.create({
      data: {
        tenantId: input.tenantId ?? null,
        programId: input.programId ?? null,
        studentProfileRef: input.studentProfileRef ?? null,
        status: input.status ?? null,
        score: input.score ?? null,
        priorityTag: input.priorityTag ?? null,
        createdAt: input.createdAt ? new Date(input.createdAt) : undefined,
      },
    });
    return { data: created };
  }

  async update(id: string, input: Partial<Application>) {
    const updated = await this.prisma.application.update({
      where: { id },
      data: {
        programId: input.programId ?? undefined,
        studentProfileRef: input.studentProfileRef ?? undefined,
        status: input.status ?? undefined,
        score: input.score ?? undefined,
        priorityTag: input.priorityTag ?? undefined,
      },
    });
    return { data: updated };
  }

  async remove(id: string) {
    try {
      await this.prisma.application.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Application not found');
    }
    return { success: true };
  }
}
