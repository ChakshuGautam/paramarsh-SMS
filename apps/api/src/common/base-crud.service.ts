import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ListParams {
  page?: number;
  perPage?: number;
  sort?: string;
  filter?: Record<string, any>;
  // For getMany
  ids?: string[];
}

export interface ListResponse<T> {
  data: T[];
  total: number;
}

export interface SingleResponse<T> {
  data: T;
}

/**
 * Base CRUD service that follows React Admin's data provider expectations
 */
@Injectable()
export abstract class BaseCrudService<T> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: string,
  ) {}

  /**
   * Get paginated list - React Admin getList
   * Returns: { data: T[], total: number }
   */
  async getList(params: ListParams): Promise<ListResponse<T>> {
    const page = Math.max(1, Number(params.page ?? 1));
    const perPage = Math.min(100, Math.max(1, Number(params.perPage ?? 25)));
    const skip = (page - 1) * perPage;

    // Build where clause from filters
    const where = this.buildWhereClause(params.filter);

    // Build order by from sort
    const orderBy = this.buildOrderBy(params.sort);

    const [data, total] = await Promise.all([
      (this.prisma as any)[this.modelName].findMany({
        where,
        skip,
        take: perPage,
        orderBy,
      }),
      (this.prisma as any)[this.modelName].count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Get single item - React Admin getOne
   * Returns: { data: T }
   */
  async getOne(id: string): Promise<SingleResponse<T>> {
    const data = await (this.prisma as any)[this.modelName].findUnique({
      where: { id },
    });

    if (!data) {
      throw new NotFoundException(`${this.modelName} not found`);
    }

    return { data };
  }

  /**
   * Get many items by IDs - React Admin getMany
   * Returns: { data: T[] }
   */
  async getMany(ids: string[]): Promise<{ data: T[] }> {
    const data = await (this.prisma as any)[this.modelName].findMany({
      where: { id: { in: ids } },
    });

    return { data };
  }

  /**
   * Get items by reference - React Admin getManyReference
   * Returns: { data: T[], total: number }
   */
  async getManyReference(
    target: string,
    id: string,
    params: ListParams,
  ): Promise<ListResponse<T>> {
    return this.getList({
      ...params,
      filter: { ...params.filter, [target]: id },
    });
  }

  /**
   * Create item - React Admin create
   * Returns: { data: T }
   */
  async create(data: any): Promise<SingleResponse<T>> {
    const created = await (this.prisma as any)[this.modelName].create({
      data,
    });

    return { data: created };
  }

  /**
   * Update item (full replacement) - React Admin update
   * Returns: { data: T }
   */
  async update(id: string, data: any): Promise<SingleResponse<T>> {
    try {
      const updated = await (this.prisma as any)[this.modelName].update({
        where: { id },
        data,
      });

      return { data: updated };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`${this.modelName} not found`);
      }
      throw error;
    }
  }

  /**
   * Update many items - React Admin updateMany
   * Returns: { data: string[] } (IDs of updated items)
   */
  async updateMany(ids: string[], data: any): Promise<{ data: string[] }> {
    await (this.prisma as any)[this.modelName].updateMany({
      where: { id: { in: ids } },
      data,
    });

    return { data: ids };
  }

  /**
   * Delete item - React Admin delete
   * Returns: { data: T } (the deleted item)
   */
  async delete(id: string): Promise<SingleResponse<T>> {
    try {
      const deleted = await (this.prisma as any)[this.modelName].delete({
        where: { id },
      });

      return { data: deleted };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`${this.modelName} not found`);
      }
      throw error;
    }
  }

  /**
   * Delete many items - React Admin deleteMany
   * Returns: { data: string[] } (IDs of deleted items)
   */
  async deleteMany(ids: string[]): Promise<{ data: string[] }> {
    await (this.prisma as any)[this.modelName].deleteMany({
      where: { id: { in: ids } },
    });

    return { data: ids };
  }

  /**
   * Build where clause from filter params
   */
  protected buildWhereClause(filter?: Record<string, any>): any {
    const where: any = {};

    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Handle different filter types
          if (key === 'q' || key === 'search') {
            // Global search - override in specific services
            where.OR = this.buildSearchClause(value);
          } else if (Array.isArray(value)) {
            // Array filter (e.g., status in ['ACTIVE', 'PENDING'])
            where[key] = { in: value };
          } else if (typeof value === 'object' && value.gte !== undefined) {
            // Range filter
            where[key] = value;
          } else {
            // Exact match
            where[key] = value;
          }
        }
      });
    }

    // Add tenant/branch scoping if needed
    const scope = PrismaService.getScope();
    if (scope.tenantId && this.supportsTenantScoping()) {
      where.tenantId = scope.tenantId;
    }
    if (scope.branchId && this.supportsBranchScoping()) {
      where.branchId = scope.branchId;
    }

    return where;
  }

  /**
   * Build order by from sort param
   */
  protected buildOrderBy(sort?: string): any {
    if (!sort) {
      return { id: 'asc' };
    }

    // Handle multiple sort fields
    const sortFields = sort.split(',');
    return sortFields.map(field => {
      const isDesc = field.startsWith('-');
      const fieldName = isDesc ? field.slice(1) : field;
      return { [fieldName]: isDesc ? 'desc' : 'asc' };
    });
  }

  /**
   * Build search clause for global search
   * Override in specific services to search relevant fields
   */
  protected buildSearchClause(search: string): any[] {
    return [];
  }

  /**
   * Override in specific services if they support tenant scoping
   */
  protected supportsTenantScoping(): boolean {
    return false;
  }

  /**
   * Override in specific services if they support branch scoping
   */
  protected supportsBranchScoping(): boolean {
    return false;
  }
}