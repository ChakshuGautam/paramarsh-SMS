import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type FeeSchedule = {
  id?: string;
  feeStructureId: string;
  recurrence: 'monthly' | 'quarterly' | 'halfYearly' | 'annual';
  dueDayOfMonth: number;
  startDate?: string | null;
  endDate?: string | null;
  classId?: string | null;
  sectionId?: string | null;
  status?: 'active' | 'paused';
};

@Injectable()
export class FeeSchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { page?: number; pageSize?: number; sort?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;
    const orderBy: any = params.sort
      ? params.sort.split(',').map((f) => ({ [f.startsWith('-') ? f.slice(1) : f]: f.startsWith('-') ? 'desc' : 'asc' }))
      : [{ id: 'asc' }];
    
    const { branchId } = PrismaService.getScope();
    const where: any = {};
    if (branchId) where.branchId = branchId;
    
    const prismaAny = this.prisma as any;
    const [data, total] = await Promise.all([
      prismaAny.feeSchedule.findMany({ where, skip, take: pageSize, orderBy }),
      prismaAny.feeSchedule.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, hasNext: skip + pageSize < total } };
  }

  async create(input: FeeSchedule) {
    const { branchId } = PrismaService.getScope();
    const prismaAny = this.prisma as any;
    const created = await prismaAny.feeSchedule.create({
      data: {
        branchId: branchId ?? null,
        feeStructureId: input.feeStructureId,
        recurrence: input.recurrence,
        dueDayOfMonth: input.dueDayOfMonth,
        startDate: input.startDate ?? null,
        endDate: input.endDate ?? null,
        classId: input.classId ?? null,
        sectionId: input.sectionId ?? null,
        status: input.status ?? 'active',
      },
    });
    return { data: created };
  }

  async update(id: string, input: Partial<FeeSchedule>) {
    try {
      const prismaAny = this.prisma as any;
      const updated = await prismaAny.feeSchedule.update({
        where: { id },
        data: {
          feeStructureId: input.feeStructureId ?? undefined,
          recurrence: input.recurrence ?? undefined,
          dueDayOfMonth: input.dueDayOfMonth ?? undefined,
          startDate: input.startDate ?? undefined,
          endDate: input.endDate ?? undefined,
          classId: input.classId ?? undefined,
          sectionId: input.sectionId ?? undefined,
          status: input.status ?? undefined,
        },
      });
      return { data: updated };
    } catch {
      throw new NotFoundException('Fee schedule not found');
    }
  }

  async remove(id: string) {
    try {
      const prismaAny = this.prisma as any;
      await prismaAny.feeSchedule.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Fee schedule not found');
    }
    return { success: true };
  }

  // Given a schedule and a target cycle start date, compute period label
  private computeNextPeriod(recurrence: FeeSchedule['recurrence'], date: Date): { period: string; dueDate: string } {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
    let end = new Date(d);
    switch (recurrence) {
      case 'monthly':
        end.setUTCMonth(d.getUTCMonth() + 1);
        break;
      case 'quarterly':
        end.setUTCMonth(d.getUTCMonth() + 3);
        break;
      case 'halfYearly':
        end.setUTCMonth(d.getUTCMonth() + 6);
        break;
      case 'annual':
        end.setUTCFullYear(d.getUTCFullYear() + 1);
        break;
    }
    const period = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    const dueDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), date.getUTCDate())).toISOString().slice(0, 10);
    return { period, dueDate };
  }

  async generateForSchedule(id: string) {
    const prismaAny = this.prisma as any;
    const schedule = await prismaAny.feeSchedule.findUnique({ where: { id } });
    if (!schedule) throw new NotFoundException('Fee schedule not found');
    if (schedule.status === 'paused') return { created: 0 };

    // Find students in scope (class/section filters)
    const whereStudent: any = {};
    // In real code, filter by class/section via current enrollments

    const students = await this.prisma.student.findMany({ where: whereStudent, select: { id: true } });

    // Compute period using current month and dueDayOfMonth
    const now = new Date();
    const { period, dueDate } = this.computeNextPeriod(schedule.recurrence as any, new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), schedule.dueDayOfMonth)));

    // Create one invoice per student with amount = sum of fee structure components
    const structure = await this.prisma.feeStructure.findUnique({ where: { id: schedule.feeStructureId }, include: { components: true } });
    if (!structure) throw new NotFoundException('Fee structure not found');
    const amount = (structure.components || []).reduce((sum, c) => sum + (c.amount || 0), 0);

    let created = 0;
    for (const s of students) {
      await this.prisma.invoice.create({ data: { studentId: s.id, period, dueDate, amount, status: 'issued' } });
      created += 1;
    }
    return { created };
  }
}
