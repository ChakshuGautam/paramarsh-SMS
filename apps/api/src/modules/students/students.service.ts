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
    // Try completely bypassing parent and doing it directly
    try {
      const page = Math.max(1, Number(params.page ?? 1));
      const perPage = Math.min(100, Math.max(1, Number(params.perPage ?? 25)));
      const skip = (page - 1) * perPage;

      // Build simple where clause WITH BRANCH FILTERING
      const where: any = {};
      
      // CRITICAL: Add branchId filtering for multi-tenancy
      if (params.branchId) {
        where.branchId = params.branchId;
      }
      
      // Add filters correctly
      if (params.filter && typeof params.filter === 'object') {
        Object.keys(params.filter).forEach(key => {
          if (params.filter[key] !== undefined && params.filter[key] !== null) {
            where[key] = params.filter[key];
          }
        });
      }
      
      // Handle search query 'q'
      if (params.q && typeof params.q === 'string') {
        where.OR = [
          { firstName: { contains: params.q, mode: 'insensitive' } },
          { lastName: { contains: params.q, mode: 'insensitive' } },
          { admissionNo: { contains: params.q, mode: 'insensitive' } }
        ];
      }
      
      // Build orderBy for sorting
      let orderBy: any = undefined;
      if (params.sort) {
        // Handle formats like "firstName:asc" or "-firstName" or "firstName"
        let sortField: string;
        let sortOrder: 'asc' | 'desc';
        
        if (params.sort.includes(':')) {
          // Format: "firstName:asc" or "firstName:desc"
          const [field, order] = params.sort.split(':');
          sortField = field;
          sortOrder = order === 'desc' ? 'desc' : 'asc';
        } else if (params.sort.startsWith('-')) {
          // Format: "-firstName"
          sortField = params.sort.slice(1);
          sortOrder = 'desc';
        } else {
          // Format: "firstName"
          sortField = params.sort;
          sortOrder = 'asc';
        }
        
        orderBy = { [sortField]: sortOrder };
      }

      console.log('Direct student query - where:', JSON.stringify(where, null, 2));

      const [data, total] = await Promise.all([
        this.prisma.student.findMany({ 
          where, 
          skip, 
          take: perPage,
          ...(orderBy && { orderBy }),
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

      return {
        data: data,
        total,
      };
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
   * Override to support search
   */
  protected buildSearchClause(search: string): any[] {
    return [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { admissionNo: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

}