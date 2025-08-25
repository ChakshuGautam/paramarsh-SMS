import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseCrudService } from '../../common/base-crud.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StudentsService extends BaseCrudService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, 'student');
  }

  /**
   * Student model now has branchId field for multi-school support
   */
  protected supportsBranchScoping(): boolean {
    return true;
  }

  /**
   * Override to add branchId filtering and include guardians
   */
  async getList(params: any) {
    // Build proper parameters for BaseCrudService
    const serviceParams = {
      page: Math.max(1, Number(params.page ?? 1)),
      perPage: Math.min(100, Math.max(1, Number(params.perPage ?? 25))),
      sort: params.sort,
      filter: { ...params.filter }
    };

    // Add branchId to filter for multi-tenancy
    if (params.branchId) {
      serviceParams.filter.branchId = params.branchId;
    }

    // Handle search query 'q' by adding to filter
    if (params.q && typeof params.q === 'string') {
      serviceParams.filter.q = params.q;
    }

    // Use the base service method but override with custom includes
    try {
      const page = serviceParams.page;
      const perPage = serviceParams.perPage;
      const skip = (page - 1) * perPage;

      // Build where clause using base service method
      const where = this.buildWhereClause(serviceParams.filter);
      const orderBy = this.buildOrderBy(serviceParams.sort);

      const [data, total] = await Promise.all([
        this.prisma.student.findMany({ 
          where, 
          skip, 
          take: perPage,
          orderBy,
          include: {
            guardians: {
              include: {
                guardian: true
              }
            }
          }
        }),
        this.prisma.student.count({ where }),
      ]);

      return { data, total };
    } catch (error) {
      console.error('Error in student getList:', error);
      throw error;
    }
  }

  /**
   * Override to add branchId filtering and include guardians
   */
  async getOne(id: string, branchId?: string) {
    const data = await (this.prisma as any)[this.modelName].findFirst({
      where: { 
        id,
        ...(branchId && { branchId }) // Add branchId filter if provided
      },
      include: {
        guardians: {
          include: {
            guardian: true
          }
        }
      }
    });

    if (!data) {
      throw new NotFoundException(`${this.modelName} not found`);
    }

    return {
      data: data,
    };
  }

  /**
   * Override to add branchId filtering and include guardians
   */
  async getMany(ids: string[], branchId?: string) {
    const data = await (this.prisma as any)[this.modelName].findMany({
      where: { 
        id: { in: ids },
        ...(branchId && { branchId }) // Add branchId filter if provided
      },
      include: {
        guardians: {
          include: {
            guardian: true
          }
        }
      }
    });

    return {
      data: data,
    };
  }

  /**
   * Override create method
   */
  async create(data: any) {
    const result = await super.create(data);
    return {
      data: result.data,
    };
  }

  /**
   * Override create method
   */
  async update(id: string, data: any) {
    const result = await super.update(id, data);
    return {
      data: result.data,
    };
  }

  /**
   * Override to add school aliasing and support soft delete
   */
  async delete(id: string, userId?: string) {
    const result = await super.delete(id, userId);
    return {
      data: result.data,
    };
  }

  /**
   * Override to support search - only search fields that exist in Student model
   */
  protected buildSearchClause(search: string): any[] {
    return [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { admissionNo: { contains: search, mode: 'insensitive' } },
    ];
  }

}