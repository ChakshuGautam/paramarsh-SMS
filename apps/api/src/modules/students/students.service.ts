import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type Student = {
  admissionNo: string;
  firstName: string;
  lastName: string;
  dob?: string;
  gender?: string;
  className: string;
  sectionName: string;
};

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: {
    page?: number;
    pageSize?: number;
    sort?: string;
    q?: string;
    className?: string;
    sectionName?: string;
  }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    const data = await this.prisma.student.findMany({
      where: {
        classId: params.className ? undefined : undefined,
      },
      skip,
      take: pageSize,
      orderBy: params.sort
        ? params.sort.split(',').map((f) => ({
            [f.startsWith('-') ? f.slice(1) : f]: f.startsWith('-')
              ? 'desc'
              : 'asc',
          }))
        : { id: 'asc' },
    });
    const total = await this.prisma.student.count();
    return {
      data,
      meta: { page, pageSize, total, hasNext: skip + pageSize < total },
    };
  }

  async create(input: Partial<Student>) {
    const created = await this.prisma.student.create({
      data: {
        admissionNo: input.admissionNo ?? null,
        firstName: input.firstName!,
        lastName: input.lastName!,
        dob: input.dob ?? null,
        gender: input.gender ?? null,
        classId: (input.className as any) ?? null,
        sectionId: (input.sectionName as any) ?? null,
      },
    });
    return { data: created };
  }

  async update(id: string, input: Partial<Student>) {
    const updated = await this.prisma.student.update({
      where: { id },
      data: {
        admissionNo: input.admissionNo ?? undefined,
        firstName: input.firstName ?? undefined,
        lastName: input.lastName ?? undefined,
        dob: input.dob ?? undefined,
        gender: input.gender ?? undefined,
      },
    });
    return { data: updated };
  }

  async remove(id: string) {
    try {
      await this.prisma.student.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Student not found');
    }
    return { success: true };
  }
}
