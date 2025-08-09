import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type Invoice = {
  studentAdmissionNo: string;
  period?: string;
  dueDate?: string;
  amount?: number;
  status?: string;
};

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { page?: number; pageSize?: number; sort?: string; studentId?: string; status?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.studentId) where.studentId = params.studentId;
    if (params.status) where.status = params.status;
    const orderBy: any = params.sort
      ? params.sort.split(',').map((f) => ({ [f.startsWith('-') ? f.slice(1) : f]: f.startsWith('-') ? 'desc' : 'asc' }))
      : [{ id: 'asc' }];

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({ where, skip, take: pageSize, orderBy }),
      this.prisma.invoice.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, hasNext: skip + pageSize < total } };
  }

  async create(input: { studentId: string; period?: string; dueDate?: string; amount?: number; status?: string; withPayment?: boolean }) {
    const inv = await this.prisma.invoice.create({ data: {
      studentId: input.studentId,
      period: input.period ?? null,
      dueDate: input.dueDate ?? null,
      amount: input.amount ?? null,
      status: input.status ?? null,
    }});
    if (input.withPayment && inv.amount) {
      await this.prisma.payment.create({ data: {
        invoiceId: inv.id,
        amount: inv.amount,
        status: 'success',
        method: 'upi',
        gateway: 'mock',
      }});
    }
    return { data: inv };
  }

  async update(id: string, input: Partial<{ period: string; dueDate: string; amount: number; status: string }>) {
    const updated = await this.prisma.invoice.update({ where: { id }, data: {
      period: input.period ?? undefined,
      dueDate: input.dueDate ?? undefined,
      amount: input.amount ?? undefined,
      status: input.status ?? undefined,
    }});
    return { data: updated };
  }

  async remove(id: string) {
    try {
      await this.prisma.invoice.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Invoice not found');
    }
    return { success: true };
  }
}
