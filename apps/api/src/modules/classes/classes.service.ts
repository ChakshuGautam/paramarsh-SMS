import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseCrudService } from '../../common/base-crud.service';

export type ClassRow = { branchId?: string; name: string; gradeLevel?: number };

@Injectable()
export class ClassesService extends BaseCrudService<any> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, 'class');
  }

  /**
   * Class model has branchId field for multi-school support
   */
  protected supportsBranchScoping(): boolean {
    return true;
  }

  /**
   * Build search clause for class search
   */
  protected buildSearchClause(search: string): any[] {
    return [
      { name: { contains: search } }
    ];
  }

  // Map the list method to use BaseCrudService's getList
  async list(params: { page?: number; perPage?: number; sort?: string; q?: string; branchId: string; filter?: any; ids?: string }) {
    // Map ids to filter if provided
    const filter = { ...params.filter };
    if (params.ids) {
      filter.id = { in: params.ids.split(',') };
    }
    
    // Use parent's getList method
    return this.getList({
      page: params.page,
      perPage: params.perPage,
      sort: params.sort,
      filter: {
        ...filter,
        ...(params.q && { q: params.q }),
        branchId: params.branchId
      }
    });
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
    // Use parent's create method which returns { data: T }
    return super.create({ 
      branchId: input.branchId,
      name: input.name, 
      gradeLevel: input.gradeLevel ?? null 
    });
  }

  async updateWithBranch(id: string, input: { name?: string; gradeLevel?: number }, branchId: string) {
    // First check if the class exists with the given branchId
    const existing = await this.prisma.class.findFirst({
      where: { id, branchId }
    });
    if (!existing) {
      throw new NotFoundException('Class not found');
    }
    
    // Use parent's update method which returns { data: T }
    return super.update(id, { 
      name: input.name ?? undefined, 
      gradeLevel: input.gradeLevel ?? undefined 
    });
  }

  async remove(id: string, branchId: string) {
    // First check if the class exists with the given branchId
    const existing = await this.prisma.class.findFirst({
      where: { id, branchId }
    });
    if (!existing) {
      throw new NotFoundException('Class not found');
    }
    
    // Use parent's delete method
    return super.delete(id);
  }
}