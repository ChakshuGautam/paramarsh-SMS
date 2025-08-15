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

    // Extract distinct parameter before building where clause
    const distinctField = params.filter?._distinct;
    const filterWithoutDistinct = { ...params.filter };
    delete filterWithoutDistinct._distinct;

    // Build where clause from filters
    const where = this.buildWhereClause(filterWithoutDistinct);

    // Build order by from sort
    const orderBy = this.buildOrderBy(params.sort);

    // Handle distinct queries
    if (distinctField) {
      return this.getDistinctList(distinctField, where, orderBy, skip, perPage);
    }

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
   * Get distinct values for a field with filtering
   */
  protected async getDistinctList(
    field: string,
    where: any,
    orderBy: any,
    skip: number,
    take: number,
  ): Promise<ListResponse<T>> {
    try {
      // For sections, get unique names with one representative from each
      if (this.modelName === 'section' && field === 'name') {
        // Get all unique section names first
        const distinctNames = await (this.prisma as any).section.groupBy({
          by: [field],
          where,
          orderBy: { [field]: 'asc' },
          _count: true,
        });

        // Get one representative record for each unique name
        const representatives = await Promise.all(
          distinctNames.slice(skip, skip + take).map(async (group: any) => {
            return (this.prisma as any).section.findFirst({
              where: { ...where, [field]: group[field] },
              orderBy,
            });
          })
        );

        return { 
          data: representatives.filter(Boolean),
          total: distinctNames.length 
        };
      }

      // Fallback to regular query for other models/fields
      const data = await (this.prisma as any)[this.modelName].findMany({
        where,
        orderBy,
        skip,
        take,
      });

      const total = await (this.prisma as any)[this.modelName].count({ where });
      return { data, total };
    } catch (error) {
      console.warn('Distinct query failed, falling back to regular query:', error);
      // If distinct fails, fallback to regular query
      const data = await (this.prisma as any)[this.modelName].findMany({
        where,
        orderBy,
        skip,
        take,
      });

      const total = await (this.prisma as any)[this.modelName].count({ where });
      return { data, total };
    }
  }

  /**
   * Build where clause from filter params
   */
  protected buildWhereClause(filter?: Record<string, any>): any {
    const where: any = {};

    // Debug log for students
    if (this.modelName === 'student' && filter) {
      console.log('Student filter received:', JSON.stringify(filter, null, 2));
    }

    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Handle different filter types
          if (key === 'q' || key === 'search') {
            // Global search - override in specific services
            where.OR = this.buildSearchClause(value);
          } else if (key.includes('.')) {
            // Nested relationship filter (e.g., "class.gradeLevel_gte")
            this.buildNestedFilter(where, key, value);
          } else if (key.endsWith('_gte')) {
            // Greater than or equal filter
            const field = key.replace('_gte', '');
            const numericValue = this.convertToNumber(value);
            where[field] = { ...where[field], gte: numericValue ?? value };
          } else if (key.endsWith('_lte')) {
            // Less than or equal filter
            const field = key.replace('_lte', '');
            const numericValue = this.convertToNumber(value);
            where[field] = { ...where[field], lte: numericValue ?? value };
          } else if (key.endsWith('_gt')) {
            // Greater than filter
            const field = key.replace('_gt', '');
            const numericValue = this.convertToNumber(value);
            where[field] = { ...where[field], gt: numericValue ?? value };
          } else if (key.endsWith('_lt')) {
            // Less than filter
            const field = key.replace('_lt', '');
            const numericValue = this.convertToNumber(value);
            where[field] = { ...where[field], lt: numericValue ?? value };
          } else if (key.endsWith('_in')) {
            // In array filter
            const field = key.replace('_in', '');
            where[field] = { in: Array.isArray(value) ? value : [value] };
          } else if (key.endsWith('_contains')) {
            // Text contains filter (case insensitive)
            const field = key.replace('_contains', '');
            where[field] = { contains: value, mode: 'insensitive' };
          } else if (Array.isArray(value)) {
            // Array filter (e.g., status in ['ACTIVE', 'PENDING'])
            where[key] = { in: value };
          } else if (typeof value === 'object' && value.gte !== undefined) {
            // Range filter object
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
   * Build nested relationship filters (e.g., "class.gradeLevel_gte")
   */
  protected buildNestedFilter(where: any, key: string, value: any): void {
    const parts = key.split('.');
    if (parts.length !== 2) return;

    const [relation, fieldWithOperator] = parts;
    
    // Debug log
    if (this.modelName === 'student') {
      console.log(`Building nested filter for student: ${relation}.${fieldWithOperator} = ${value}`);
    }
    let field = fieldWithOperator;
    let operator = 'equals';
    let operatorValue = value;

    // Extract operator from field name
    if (fieldWithOperator.endsWith('_gte')) {
      field = fieldWithOperator.replace('_gte', '');
      operator = 'gte';
    } else if (fieldWithOperator.endsWith('_lte')) {
      field = fieldWithOperator.replace('_lte', '');
      operator = 'lte';
    } else if (fieldWithOperator.endsWith('_gt')) {
      field = fieldWithOperator.replace('_gt', '');
      operator = 'gt';
    } else if (fieldWithOperator.endsWith('_lt')) {
      field = fieldWithOperator.replace('_lt', '');
      operator = 'lt';
    } else if (fieldWithOperator.endsWith('_in')) {
      field = fieldWithOperator.replace('_in', '');
      operator = 'in';
      operatorValue = Array.isArray(value) ? value : [value];
    }

    // Build nested where clause
    if (!where[relation]) {
      where[relation] = {};
    }

    if (operator === 'equals') {
      where[relation][field] = operatorValue;
    } else {
      where[relation][field] = { [operator]: operatorValue };
    }
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

  /**
   * Convert string values to numbers for numeric filters
   */
  private convertToNumber(value: any): number | null {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }
}