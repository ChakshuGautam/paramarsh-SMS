import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type ClassRow = { branchId?: string; name: string; gradeLevel?: number };

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { page?: number; perPage?: number; sort?: string; q?: string; branchId: string; filter?: any; ids?: string }) {
    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.perPage ?? 25)));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.q) where.name = { contains: params.q, mode: 'insensitive' };
    
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
    const orderBy: any = params.sort
      ? params.sort.split(',').map((f) => ({ [f.startsWith('-') ? f.slice(1) : f]: f.startsWith('-') ? 'desc' : 'asc' }))
      : [{ id: 'asc' }];

    const [data, total] = await Promise.all([
      this.prisma.class.findMany({ where: { ...where }, skip, take: pageSize, orderBy }),
      this.prisma.class.count({ where: { ...where } }),
    ]);
    return { data, total };
  }

  async findOne(id: string, branchId: string) {
    const entity = await this.prisma.class.findFirst({
      where: { id, branchId },
    });
    if (!entity) {
      throw new NotFoundException('Class not found');
    }
    return { data: entity };
  }

  async create(input: { name: string; gradeLevel?: number; branchId: string }) {
    const created = await this.prisma.class.create({ 
      data: { 
        branchId: input.branchId,
        name: input.name, 
        gradeLevel: input.gradeLevel ?? null 
      } 
    });
    return { data: created };
  }

  async update(id: string, input: { name?: string; gradeLevel?: number }, branchId: string) {
    // First check if the class exists with the given branchId
    const existing = await this.prisma.class.findFirst({
      where: { id, branchId }
    });
    if (!existing) {
      throw new NotFoundException('Class not found');
    }
    
    const updated = await this.prisma.class.update({ 
      where: { id }, 
      data: { 
        name: input.name ?? undefined, 
        gradeLevel: input.gradeLevel ?? undefined 
      } 
    });
    return { data: updated };
  }

  async remove(id: string, branchId: string) {
    // First check if the class exists with the given branchId
    const existing = await this.prisma.class.findFirst({
      where: { id, branchId }
    });
    if (!existing) {
      throw new NotFoundException('Class not found');
    }
    
    await this.prisma.class.delete({ where: { id } });
    return { data: { id } };
  }
}
