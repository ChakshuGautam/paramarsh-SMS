import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type FeeStructure = { id?: string; gradeId?: string };
export type FeeComponent = { id?: string; feeStructureId: string; name: string; type?: string; amount: number };

@Injectable()
export class FeeStructuresService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { page?: number; pageSize?: number; sort?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    const orderBy: any = params.sort
      ? params.sort.split(',').map((f) => ({ [f.startsWith('-') ? f.slice(1) : f]: f.startsWith('-') ? 'desc' : 'asc' }))
      : [{ id: 'asc' }];

    const [data, total] = await Promise.all([
      this.prisma.feeStructure.findMany({ skip, take: pageSize, orderBy, include: { components: true } }),
      this.prisma.feeStructure.count(),
    ]);
    return { data, meta: { page, pageSize, total, hasNext: skip + pageSize < total } };
  }

  async createStructure(input: FeeStructure) {
    const created = await this.prisma.feeStructure.create({ data: { gradeId: input.gradeId ?? null } });
    return { data: created };
  }

  async updateStructure(id: string, input: FeeStructure) {
    const updated = await this.prisma.feeStructure.update({ where: { id }, data: { gradeId: input.gradeId ?? undefined } });
    return { data: updated };
  }

  async removeStructure(id: string) {
    try {
      await this.prisma.feeStructure.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Fee structure not found');
    }
    return { success: true };
  }

  async createComponent(input: FeeComponent) {
    const created = await this.prisma.feeComponent.create({ data: {
      feeStructureId: input.feeStructureId,
      name: input.name,
      type: input.type ?? null,
      amount: input.amount,
    }});
    return { data: created };
  }

  async updateComponent(id: string, input: Partial<FeeComponent>) {
    const updated = await this.prisma.feeComponent.update({ where: { id }, data: {
      name: input.name ?? undefined,
      type: input.type ?? undefined,
      amount: input.amount ?? undefined,
    }});
    return { data: updated };
  }

  async removeComponent(id: string) {
    try {
      await this.prisma.feeComponent.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Fee component not found');
    }
    return { success: true };
  }
}
