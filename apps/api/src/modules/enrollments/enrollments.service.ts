import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type Enrollment = {
  studentAdmissionNo: string;
  className: string;
  sectionName: string;
  status?: string;
  startDate?: string;
  endDate?: string;
};

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { page?: number; pageSize?: number; sort?: string; sectionId?: string; status?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.sectionId) where.sectionId = params.sectionId;
    if (params.status) where.status = params.status;
    const { branchId } = PrismaService.getScope();
    if (branchId) where.branchId = branchId;

    const orderBy: any = params.sort
      ? params.sort.split(',').map((f) => ({ [f.startsWith('-') ? f.slice(1) : f]: f.startsWith('-') ? 'desc' : 'asc' }))
      : [{ id: 'asc' }];

    const [data, total] = await Promise.all([
      this.prisma.enrollment.findMany({ where, skip, take: pageSize, orderBy }),
      this.prisma.enrollment.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, hasNext: skip + pageSize < total } };
  }

  async create(input: { studentId: string; sectionId: string; status?: string; startDate?: string; endDate?: string }) {
    const created = await this.prisma.$transaction(async (tx) => {
      // Close any active enrollment
      await tx.enrollment.updateMany({ where: { studentId: input.studentId, endDate: null }, data: { endDate: input.startDate ?? new Date().toISOString().slice(0, 10), status: 'transferred' } });
      // Create new enrollment
      const enr = await tx.enrollment.create({ data: {
        studentId: input.studentId,
        sectionId: input.sectionId,
        status: input.status ?? 'active',
        startDate: input.startDate ?? new Date().toISOString().slice(0, 10),
        endDate: input.endDate ?? null,
      }});
      // Update student's current section/class from section
      const section = await tx.section.findUnique({ where: { id: input.sectionId } });
      if (section) {
        await tx.student.update({ where: { id: input.studentId }, data: { sectionId: section.id, classId: section.classId } });
      }
      return enr;
    });
    return { data: created };
  }

  async update(id: string, input: Partial<{ sectionId: string; status: string; startDate: string; endDate: string }>) {
    const updated = await this.prisma.enrollment.update({ where: { id }, data: {
      sectionId: input.sectionId ?? undefined,
      status: input.status ?? undefined,
      startDate: input.startDate ?? undefined,
      endDate: input.endDate ?? undefined,
    }});
    return { data: updated };
  }

  async remove(id: string) {
    try {
      await this.prisma.enrollment.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Enrollment not found');
    }
    return { success: true };
  }
}
