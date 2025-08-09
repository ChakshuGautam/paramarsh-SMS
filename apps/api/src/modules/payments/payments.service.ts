import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type Payment = {
  studentAdmissionNo: string;
  period?: string;
  amount?: number;
  status?: string;
  method?: string;
  gateway?: string;
  reference?: string;
};

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { page?: number; pageSize?: number; sort?: string; status?: string; method?: string; invoiceId?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.method) where.method = params.method;
    if (params.invoiceId) where.invoiceId = params.invoiceId;

    const orderBy: any = params.sort
      ? params.sort.split(',').map((f) => ({ [f.startsWith('-') ? f.slice(1) : f]: f.startsWith('-') ? 'desc' : 'asc' }))
      : [{ id: 'asc' }];

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({ where, skip, take: pageSize, orderBy }),
      this.prisma.payment.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, hasNext: skip + pageSize < total } };
  }

  async create(input: { invoiceId: string; amount?: number; status?: string; method?: string; gateway?: string; reference?: string }) {
    const created = await this.prisma.payment.create({ data: {
      invoiceId: input.invoiceId,
      amount: input.amount ?? null,
      status: input.status ?? null,
      method: input.method ?? null,
      gateway: input.gateway ?? null,
      reference: input.reference ?? null,
    }});
    return { data: created };
  }

  async update(id: string, input: Partial<{ amount: number; status: string; method: string; gateway: string; reference: string }>) {
    const updated = await this.prisma.payment.update({ where: { id }, data: {
      amount: input.amount ?? undefined,
      status: input.status ?? undefined,
      method: input.method ?? undefined,
      gateway: input.gateway ?? undefined,
      reference: input.reference ?? undefined,
    }});
    return { data: updated };
  }

  async remove(id: string) {
    try {
      await this.prisma.payment.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Payment not found');
    }
    return { success: true };
  }
}
