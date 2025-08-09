import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type Attendance = {
  id?: string;
  studentId: string;
  date: string;
  status?: string;
  reason?: string;
  markedBy?: string;
  source?: string;
};

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { page?: number; pageSize?: number; sort?: string; studentId?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.studentId) where.studentId = params.studentId;
    const { branchId } = PrismaService.getScope();
    if (branchId) where.branchId = branchId;
    const orderBy: any = params.sort
      ? params.sort.split(',').map((f) => ({ [f.startsWith('-') ? f.slice(1) : f]: f.startsWith('-') ? 'desc' : 'asc' }))
      : [{ date: 'desc' }];

    const [data, total] = await Promise.all([
      this.prisma.attendanceRecord.findMany({ where, skip, take: pageSize, orderBy }),
      this.prisma.attendanceRecord.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, hasNext: skip + pageSize < total } };
  }

  async create(input: Attendance) {
    const created = await this.prisma.attendanceRecord.create({ data: {
      studentId: input.studentId,
      date: input.date,
      status: input.status ?? null,
      reason: input.reason ?? null,
      markedBy: input.markedBy ?? null,
      source: input.source ?? null,
    }});
    return { data: created };
  }

  async update(id: string, input: Partial<Attendance>) {
    const updated = await this.prisma.attendanceRecord.update({ where: { id }, data: {
      date: input.date ?? undefined,
      status: input.status ?? undefined,
      reason: input.reason ?? undefined,
      markedBy: input.markedBy ?? undefined,
      source: input.source ?? undefined,
    }});
    return { data: updated };
  }

  async remove(id: string) {
    try {
      await this.prisma.attendanceRecord.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Attendance record not found');
    }
    return { success: true };
  }
}
