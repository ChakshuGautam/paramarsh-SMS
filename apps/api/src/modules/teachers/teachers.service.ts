import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseCrudService } from '../../common/base-crud.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TeachersService extends BaseCrudService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, 'teacher');
  }

  /**
   * Override getList to include staff relation and proper branchId filtering
   */
  async getList(params: any) {
    const page = Math.max(1, Number(params.page ?? 1));
    const perPage = Math.min(100, Math.max(1, Number(params.perPage ?? params.pageSize ?? 25)));
    const skip = (page - 1) * perPage;

    // Build where clause with branchId filtering
    const where: any = {};
    
    // CRITICAL: Add branchId filtering for multi-tenancy
    if (params.branchId) {
      where.branchId = params.branchId;
    }
    
    // Add filters with proper handling of complex operators
    if (params.filter && typeof params.filter === 'object') {
      Object.keys(params.filter).forEach(key => {
        if (params.filter[key] !== undefined && params.filter[key] !== null) {
          const filterValue = params.filter[key];
          
          // Handle complex MongoDB-style operators
          if (typeof filterValue === 'object' && filterValue !== null) {
            const convertedFilter: any = {};
            
            Object.keys(filterValue).forEach(operator => {
              switch (operator) {
                case '$contains':
                  convertedFilter.contains = filterValue[operator];
                  convertedFilter.mode = 'insensitive';
                  break;
                case '$gte':
                  convertedFilter.gte = filterValue[operator];
                  break;
                case '$lte':
                  convertedFilter.lte = filterValue[operator];
                  break;
                case '$gt':
                  convertedFilter.gt = filterValue[operator];
                  break;
                case '$lt':
                  convertedFilter.lt = filterValue[operator];
                  break;
                case '$in':
                  convertedFilter.in = filterValue[operator];
                  break;
                case '$not':
                  convertedFilter.not = filterValue[operator];
                  break;
                default:
                  convertedFilter[operator] = filterValue[operator];
              }
            });
            
            where[key] = convertedFilter;
          } else {
            // Simple equality filter
            where[key] = filterValue;
          }
        }
      });
    }
    
    // Handle search query 'q'
    if (params.q && typeof params.q === 'string') {
      where.OR = [
        { subjects: { contains: params.q, mode: 'insensitive' } },
        { qualifications: { contains: params.q, mode: 'insensitive' } },
        { staff: { firstName: { contains: params.q, mode: 'insensitive' } } },
        { staff: { lastName: { contains: params.q, mode: 'insensitive' } } },
        { staff: { email: { contains: params.q, mode: 'insensitive' } } },
      ];
    }

    // Build orderBy for sorting  
    let orderBy: any = undefined;
    if (params.sort) {
      let sortField: string;
      let sortOrder: 'asc' | 'desc';
      
      if (params.sort.includes(':')) {
        const [field, order] = params.sort.split(':');
        sortField = field;
        sortOrder = order === 'desc' ? 'desc' : 'asc';
      } else if (params.sort.startsWith('-')) {
        sortField = params.sort.slice(1);
        sortOrder = 'desc';
      } else {
        sortField = params.sort;
        sortOrder = 'asc';
      }
      
      orderBy = { [sortField]: sortOrder };
    }

    const [data, total] = await Promise.all([
      this.prisma.teacher.findMany({
        where,
        skip,
        take: perPage,
        ...(orderBy && { orderBy }),
        include: {
          staff: true,
        },
      }),
      this.prisma.teacher.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Override getOne to include staff relation and branchId filtering
   */
  async getOne(id: string, branchId?: string) {
    const data = await this.prisma.teacher.findFirst({
      where: { 
        id,
        ...(branchId && { branchId })
      },
      include: {
        staff: true,
      },
    });

    if (!data) {
      throw new NotFoundException('Teacher not found');
    }

    return { data };
  }

  /**
   * Get multiple teachers by IDs
   */
  async getMany(ids: string[], branchId?: string) {
    const data = await this.prisma.teacher.findMany({
      where: { 
        id: { in: ids },
        ...(branchId && { branchId })
      },
      include: {
        staff: true,
      },
    });

    return { data };
  }

  /**
   * Create teacher
   */
  async create(data: any) {
    const result = await this.prisma.teacher.create({
      data,
      include: {
        staff: true,
      },
    });

    return { data: result };
  }

  /**
   * Update teacher
   */
  async update(id: string, data: any) {
    const result = await this.prisma.teacher.update({
      where: { id },
      data,
      include: {
        staff: true,
      },
    });

    return { data: result };
  }

  /**
   * Delete teacher
   */
  async delete(id: string) {
    const result = await this.prisma.teacher.delete({
      where: { id },
      include: {
        staff: true,
      },
    });

    return { data: result };
  }

  /**
   * Override to support search on staff fields
   */
  protected buildSearchClause(search: string): any[] {
    return [
      { subjects: { contains: search, mode: 'insensitive' } },
      { qualifications: { contains: search, mode: 'insensitive' } },
      { staff: { firstName: { contains: search, mode: 'insensitive' } } },
      { staff: { lastName: { contains: search, mode: 'insensitive' } } },
      { staff: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }

  /**
   * Teachers now have branchId field for multi-school support
   */
  protected supportsBranchScoping(): boolean {
    return true;
  }
}