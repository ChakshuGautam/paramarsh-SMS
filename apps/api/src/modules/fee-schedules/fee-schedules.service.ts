import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DEFAULT_BRANCH_ID } from '../../common/constants';

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

  async list(params: { page?: number; perPage?: number; sort?: string; filter?: any; branchId?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.perPage ?? 25)));
    const skip = (page - 1) * pageSize;
    const orderBy: any = params.sort
      ? params.sort.split(',').map((f) => {
          let field = f.startsWith('-') ? f.slice(1) : f;
          const direction = f.startsWith('-') ? 'desc' : 'asc';
          
          // Map frontend field names to database field names
          if (field === 'dueDate') field = 'dueDayOfMonth';
          
          return { [field]: direction };
        })
      : [{ id: 'asc' }];
    
    const branchId = params.branchId || DEFAULT_BRANCH_ID;
    const where: any = { branchId, ...(params.filter || {}) };
    
    const [data, total] = await Promise.all([
      this.prisma.feeSchedule.findMany({ where, skip, take: pageSize, orderBy }),
      this.prisma.feeSchedule.count({ where }),
    ]);
    return { data, total };
  }

  async getOne(id: string, branchId: string = DEFAULT_BRANCH_ID) {
    const where: any = { id, branchId };
    
    const feeSchedule = await this.prisma.feeSchedule.findFirst({ where });
    
    if (!feeSchedule) {
      throw new NotFoundException('Fee schedule not found');
    }
    
    return { data: feeSchedule };
  }

  async create(input: FeeSchedule, branchId: string = DEFAULT_BRANCH_ID) {
    const created = await this.prisma.feeSchedule.create({
      data: {
        branchId,
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

  async update(id: string, input: Partial<FeeSchedule>, branchId: string = DEFAULT_BRANCH_ID) {
    const where: any = { id, branchId };
    
    try {
      // First check if the record exists and belongs to the correct branch
      const existing = await this.prisma.feeSchedule.findFirst({ where });
      if (!existing) {
        throw new NotFoundException('Fee schedule not found');
      }
      
      const updated = await this.prisma.feeSchedule.update({
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
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new NotFoundException('Fee schedule not found');
    }
  }

  async remove(id: string, branchId: string = DEFAULT_BRANCH_ID) {
    const where: any = { id, branchId };
    
    try {
      // First check if the record exists and belongs to the correct branch
      const existing = await this.prisma.feeSchedule.findFirst({ where });
      if (!existing) {
        throw new NotFoundException('Fee schedule not found');
      }
      
      const deleted = await this.prisma.feeSchedule.delete({ where: { id } });
      return { data: deleted };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new NotFoundException('Fee schedule not found');
    }
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

  async generateForSchedule(id: string, branchId: string = DEFAULT_BRANCH_ID) {
    const schedule = await this.prisma.feeSchedule.findFirst({ where: { id, branchId } });
    if (!schedule) throw new NotFoundException('Fee schedule not found');
    if (schedule.status === 'paused') return { created: 0 };

    // Find students in scope (class/section filters)
    const whereStudent: any = {};
    // In real code, filter by class/section via current enrollments

    const students = await this.prisma.student.findMany({ where: { ...whereStudent, branchId }, select: { id: true, branchId: true } });

    // Compute period using current month and dueDayOfMonth
    const now = new Date();
    const { period, dueDate } = this.computeNextPeriod(schedule.recurrence as any, new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), schedule.dueDayOfMonth)));

    // Create one invoice per student with amount = sum of fee structure components
    const structure = await this.prisma.feeStructure.findFirst({ where: { id: schedule.feeStructureId, branchId }, include: { components: true } });
    if (!structure) throw new NotFoundException('Fee structure not found');
    const amount = (structure.components || []).reduce((sum, c) => sum + (c.amount || 0), 0);

    let created = 0;
    for (const s of students) {
      // Check if invoice already exists for this student and period
      const existing = await this.prisma.invoice.findFirst({
        where: { studentId: s.id, period, branchId }
      });
      
      if (!existing) {
        // Generate a simple invoice number for fee schedule generation
        const invoiceNumber = `FS-${schedule.id.slice(-8)}-${s.id.slice(-4)}-${created.toString().padStart(3, '0')}`;
        
        await this.prisma.invoice.create({ 
          data: { 
            studentId: s.id,
            invoiceNumber,
            period, 
            dueDate, 
            amount, 
            status: 'issued',
            branchId: s.branchId // Include branchId for multi-tenancy
          } 
        });
        created += 1;
      }
    }
    return { created };
  }
}
