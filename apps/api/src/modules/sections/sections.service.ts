import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type Section = { id?: string; branchId?: string; classId: string; name: string; capacity?: number };

@Injectable()
export class SectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { page?: number; perPage?: number; pageSize?: number; sort?: string; classId?: string; branchId: string; filter?: any; ids?: string; q?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const perPage = Math.min(200, Math.max(1, Number(params.perPage ?? params.pageSize ?? 25)));
    const skip = (page - 1) * perPage;

    const where: any = {};
    if (params.classId) where.classId = params.classId;
    
    // Handle filter parameter
    if (params.filter) {
      Object.assign(where, params.filter);
    }
    
    // Handle ids parameter
    if (params.ids) {
      where.id = { in: params.ids.split(',') };
    }
    
    // Add branchId filtering
    where.branchId = params.branchId;
    
    // Handle search query
    if (params.q) {
      where.OR = [
        { name: { contains: params.q, mode: 'insensitive' } },
        { class: { name: { contains: params.q, mode: 'insensitive' } } },
      ];
    }
    
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
        take: perPage, 
        orderBy,
        include: {
          class: true,
        }
      }),
      this.prisma.section.count({ where }),
    ]);
    return { data, total };
  }

  async findOne(id: string, branchId: string) {
    const section = await this.prisma.section.findUnique({
      where: { id, branchId },
      include: {
        class: true,
      }
    });
    if (!section) {
      throw new NotFoundException('Section not found');
    }
    return { data: section };
  }

  async create(input: Section & { branchId: string }) {
    const created = await this.prisma.section.create({
      data: { 
        branchId: input.branchId,
        classId: input.classId, 
        name: input.name, 
        capacity: input.capacity ?? null 
      },
    });
    return { data: created };
  }

  async update(id: string, input: Partial<Section>, branchId: string) {
    const updated = await this.prisma.section.update({
      where: { id, branchId },
      data: {
        classId: input.classId ?? undefined,
        name: input.name ?? undefined,
        capacity: input.capacity ?? undefined,
      },
    });
    return { data: updated };
  }

  async remove(id: string, branchId: string) {
    try {
      await this.prisma.section.delete({ where: { id, branchId } });
    } catch {
      throw new NotFoundException('Section not found');
    }
    return { data: { id } };
  }
}
