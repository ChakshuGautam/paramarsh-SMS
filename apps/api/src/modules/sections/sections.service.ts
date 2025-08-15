import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type Section = { id?: string; branchId?: string; classId: string; name: string; capacity?: number };

@Injectable()
export class SectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { page?: number; pageSize?: number; sort?: string; classId?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 25)));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.classId) where.classId = params.classId;
    // Add branchId filtering from request scope
    const { branchId } = PrismaService.getScope();
    if (branchId) where.branchId = branchId;
    
    // Handle sorting, including nested field sorting
    let orderBy: any = [{ id: 'asc' }]; // default
    if (params.sort) {
      const sortField = params.sort.startsWith('-') ? params.sort.slice(1) : params.sort;
      const sortDirection = params.sort.startsWith('-') ? 'desc' : 'asc';
      
      // Handle nested sorting for class.gradeLevel
      if (sortField === 'class.gradeLevel') {
        orderBy = [{ class: { gradeLevel: sortDirection } }];
      } else {
        orderBy = [{ [sortField]: sortDirection }];
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.section.findMany({ 
        where, 
        skip, 
        take: pageSize, 
        orderBy,
        include: {
          class: true,
        }
      }),
      this.prisma.section.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, hasNext: skip + pageSize < total } };
  }

  async findOne(id: string) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: {
        class: true,
      }
    });
    if (!section) {
      throw new NotFoundException('Section not found');
    }
    return { data: section };
  }

  async create(input: Section) {
    const { branchId } = PrismaService.getScope();
    const created = await this.prisma.section.create({
      data: { 
        branchId: branchId ?? undefined,
        classId: input.classId, 
        name: input.name, 
        capacity: input.capacity ?? null 
      },
    });
    return { data: created };
  }

  async update(id: string, input: Partial<Section>) {
    const updated = await this.prisma.section.update({
      where: { id },
      data: {
        classId: input.classId ?? undefined,
        name: input.name ?? undefined,
        capacity: input.capacity ?? undefined,
      },
    });
    return { data: updated };
  }

  async remove(id: string) {
    try {
      await this.prisma.section.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Section not found');
    }
    return { success: true };
  }
}
