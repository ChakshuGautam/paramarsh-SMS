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

  async list(params: { page?: number; perPage?: number; sort?: string; status?: string; method?: string; invoiceId?: string; filter?: any; branchId: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.perPage ?? 25)));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.method) where.method = params.method;
    if (params.invoiceId) where.invoiceId = params.invoiceId;
    
    // Handle filter parameter
    if (params.filter) {
      Object.assign(where, params.filter);
    }
    
    // Multi-tenancy through invoice relationship
    where.invoice = {
      student: {
        branchId: params.branchId
      }
    };

    const orderBy: any = params.sort
      ? params.sort.split(',').map((f) => {
          let field = f.startsWith('-') ? f.slice(1) : f;
          const direction = f.startsWith('-') ? 'desc' : 'asc';
          
          // Ensure field exists in the model
          const validFields = ['id', 'invoiceId', 'amount', 'status', 'method', 'gateway', 'reference', 'createdAt', 'updatedAt'];
          if (!validFields.includes(field)) {
            field = 'id'; // fallback to id if field doesn't exist
          }
          
          return { [field]: direction };
        })
      : [{ createdAt: 'desc' }];

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({ 
        where, 
        skip, 
        take: pageSize, 
        orderBy,
        include: {
          invoice: {
            include: {
              student: true
            }
          }
        }
      }),
      this.prisma.payment.count({ where }),
    ]);
    return { data, total };
  }

  async getOne(id: string, branchId: string) {
    const payment = await this.prisma.payment.findUnique({ 
      where: { id },
      include: {
        invoice: {
          include: {
            student: true
          }
        }
      }
    });
    
    // Check tenant isolation
    if (!payment || payment.invoice.student.branchId !== branchId) {
      throw new NotFoundException('Payment not found');
    }
    return { data: payment };
  }

  async create(input: { invoiceId: string; amount?: number; status?: string; method?: string; gateway?: string; reference?: string; branchId: string }) {
    const created = await this.prisma.$transaction(async (tx) => {
      // Generate reference if not provided
      const reference = input.reference ?? `PAY2024${String(Date.now()).slice(-6)}`;
      
      const pay = await tx.payment.create({ data: {
        invoiceId: input.invoiceId,
        amount: input.amount ?? null,
        status: input.status ?? 'COMPLETED',
        method: input.method ?? 'UPI',
        gateway: input.gateway ?? 'RAZORPAY',
        reference: reference,
        // branchId inherited through invoice
      }});
      // Recompute invoice status by summing successful payments
      const invoice = await tx.invoice.findUnique({ where: { id: input.invoiceId } });
      if (invoice) {
        const payments = await tx.payment.findMany({ where: { invoiceId: invoice.id, status: 'success' } });
        const paid = payments.reduce((s, p) => s + (p.amount ?? 0), 0);
        const nextStatus = !invoice.amount || paid === 0 ? invoice.status ?? 'issued' : paid >= (invoice.amount ?? 0) ? 'paid' : 'partial';
        await tx.invoice.update({ where: { id: invoice.id }, data: { status: nextStatus } });
      }
      return pay;
    });
    return { data: created };
  }

  async update(id: string, input: Partial<{ amount: number; status: string; method: string; gateway: string; reference: string }>, branchId: string) {
    // First check if payment exists and belongs to branch
    const existing = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            student: true
          }
        }
      }
    });
    
    if (!existing || existing.invoice.student.branchId !== branchId) {
      throw new NotFoundException('Payment not found');
    }
    
    const updated = await this.prisma.payment.update({ where: { id }, data: {
      amount: input.amount ?? undefined,
      status: input.status ?? undefined,
      method: input.method ?? undefined,
      gateway: input.gateway ?? undefined,
      reference: input.reference ?? undefined,
    }});
    return { data: updated };
  }

  async remove(id: string, branchId: string) {
    try {
      // First check if payment exists and belongs to branch
      const existing = await this.prisma.payment.findUnique({
        where: { id },
        include: {
          invoice: {
            include: {
              student: true
            }
          }
        }
      });
      
      if (!existing || existing.invoice.student.branchId !== branchId) {
        throw new NotFoundException('Payment not found');
      }
      
      await this.prisma.payment.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Payment not found');
    }
    return { data: { id } };
  }
}
