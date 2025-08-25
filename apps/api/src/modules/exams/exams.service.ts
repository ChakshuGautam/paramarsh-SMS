import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type Exam = { 
  id?: string; 
  name: string; 
  startDate?: string; 
  endDate?: string;
  examType?: string;
  academicYearId?: string;
  term?: number;
  weightagePercent?: number;
  minPassingMarks?: number;
  maxMarks?: number;
  status?: string;
};

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { 
    page?: number; 
    pageSize?: number;
    perPage?: number; // Support both parameters
    sort?: string; 
    q?: string;
    startDateGte?: string;
    startDateLte?: string;
    startDateGt?: string;
    endDateGte?: string;
    endDateLte?: string;
    examType?: string;
    academicYearId?: string;
    term?: number | string;
    status?: string;
  }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.perPage ?? params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    
    // Text search
    if (params.q) {
      where.name = { contains: params.q, mode: 'insensitive' };
    }
    
    // Date filters - dates are stored as strings in the database
    if (params.startDateGte || params.startDateLte || params.startDateGt) {
      where.startDate = {};
      if (params.startDateGte) where.startDate.gte = params.startDateGte;
      if (params.startDateLte) where.startDate.lte = params.startDateLte;
      if (params.startDateGt) where.startDate.gt = params.startDateGt;
    }
    
    if (params.endDateGte || params.endDateLte) {
      where.endDate = {};
      if (params.endDateGte) where.endDate.gte = params.endDateGte;
      if (params.endDateLte) where.endDate.lte = params.endDateLte;
    }
    
    // Exam type filter
    if (params.examType) {
      where.examType = params.examType;
    }
    
    // Academic year filter
    if (params.academicYearId) {
      where.academicYearId = params.academicYearId;
    }
    
    // Term filter
    if (params.term) {
      where.term = Number(params.term);
    }
    
    // Status filter
    if (params.status) {
      where.status = params.status;
    }
    
    // Branch scoping
    const { branchId } = PrismaService.getScope();
    if (branchId) where.branchId = branchId;
    
    // Sorting
    const orderBy: any = params.sort
      ? params.sort.split(',').map((f) => ({ [f.startsWith('-') ? f.slice(1) : f]: f.startsWith('-') ? 'desc' : 'asc' }))
      : [{ startDate: 'desc' }]; // Default sort by start date descending

    const [data, total] = await Promise.all([
      this.prisma.exam.findMany({ where, skip, take: pageSize, orderBy }),
      this.prisma.exam.count({ where }),
    ]);
    return { data, total };
  }

  async getOne(id: string) {
    const { branchId } = PrismaService.getScope();
    
    const exam = await this.prisma.exam.findFirst({
      where: { id, branchId }
    });
    
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    
    return { data: exam };
  }

  async create(input: Exam) {
    const { branchId } = PrismaService.getScope();
    
    const created = await this.prisma.exam.create({ 
      data: { 
        branchId,
        name: input.name,
        examType: input.examType ?? undefined,
        academicYearId: input.academicYearId ?? undefined,
        term: input.term ?? undefined,
        weightagePercent: input.weightagePercent ?? undefined,
        minPassingMarks: input.minPassingMarks ?? undefined,
        maxMarks: input.maxMarks ?? undefined,
        status: input.status ?? 'SCHEDULED',
        startDate: input.startDate ?? null,
        endDate: input.endDate ?? null
      }
    });
    return { data: created };
  }

  async update(id: string, input: Partial<Exam>) {
    const { branchId } = PrismaService.getScope();
    
    // First verify the exam belongs to this branch
    const exam = await this.prisma.exam.findFirst({
      where: { id, branchId }
    });
    
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
    
    const updated = await this.prisma.exam.update({ 
      where: { id },
      data: { 
        name: input.name ?? undefined,
        examType: input.examType ?? undefined,
        academicYearId: input.academicYearId ?? undefined,
        term: input.term ?? undefined,
        weightagePercent: input.weightagePercent ?? undefined,
        minPassingMarks: input.minPassingMarks ?? undefined,
        maxMarks: input.maxMarks ?? undefined,
        status: input.status ?? undefined,
        startDate: input.startDate ?? undefined,
        endDate: input.endDate ?? undefined
      }
    });
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
