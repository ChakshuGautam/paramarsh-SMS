import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
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
    try {
      const created = await (this.prisma as any)[this.modelName].create({
        data,
      });

      return { data: created };
    } catch (error: any) {
      if (error.code === 'P2002') {
        // Unique constraint violation
        throw new ConflictException(`A record with this ${error.meta?.target?.join(' or ')} already exists`);
      }
      if (error.code === 'P2003') {
        // Foreign key constraint violation
        throw new BadRequestException('Invalid reference to related record');
      }
      // Re-throw other errors as-is
      throw error;
    }
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
   * Delete item - React Admin delete (soft delete if supported)
   * Returns: { data: T } (the deleted item)
   */
  async delete(id: string, userId?: string): Promise<SingleResponse<T>> {
    try {
      if (this.supportsSoftDelete()) {
        // Soft delete - just update the deletedAt timestamp
        const updated = await (this.prisma as any)[this.modelName].update({
          where: { id },
          data: {
            deletedAt: new Date(),
            deletedBy: userId || 'system',
          },
        });
        return { data: updated };
      } else {
        // Hard delete for models without soft delete support
        const deleted = await (this.prisma as any)[this.modelName].delete({
          where: { id },
        });
        return { data: deleted };
      }
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`${this.modelName} not found`);
      }
      throw error;
    }
  }

  /**
   * Delete many items - React Admin deleteMany (soft delete if supported)
   * Returns: { data: string[] } (IDs of deleted items)
   */
  async deleteMany(ids: string[], userId?: string): Promise<{ data: string[] }> {
    if (this.supportsSoftDelete()) {
      // Soft delete - update deletedAt timestamp for all records
      await (this.prisma as any)[this.modelName].updateMany({
        where: { id: { in: ids } },
        data: {
          deletedAt: new Date(),
          deletedBy: userId || 'system',
        },
      });
    } else {
      // Hard delete for models without soft delete support
      await (this.prisma as any)[this.modelName].deleteMany({
        where: { id: { in: ids } },
      });
    }

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

    // Exclude soft deleted records by default
    if (this.supportsSoftDelete()) {
      where.deletedAt = null;
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
<<<<<<< HEAD
            // Only convert to number if the field likely contains numeric data
            const numericValue = this.shouldConvertToNumber(field, value) ? this.convertToNumber(value) : null;
=======
            const numericValue = this.convertToNumber(value);
>>>>>>> origin/main
            where[field] = { ...where[field], gte: numericValue ?? value };
          } else if (key.endsWith('_lte')) {
            // Less than or equal filter
            const field = key.replace('_lte', '');
<<<<<<< HEAD
            // Only convert to number if the field likely contains numeric data
            const numericValue = this.shouldConvertToNumber(field, value) ? this.convertToNumber(value) : null;
=======
            const numericValue = this.convertToNumber(value);
>>>>>>> origin/main
            where[field] = { ...where[field], lte: numericValue ?? value };
          } else if (key.endsWith('_gt')) {
            // Greater than filter
            const field = key.replace('_gt', '');
<<<<<<< HEAD
            // Only convert to number if the field likely contains numeric data
            const numericValue = this.shouldConvertToNumber(field, value) ? this.convertToNumber(value) : null;
=======
            const numericValue = this.convertToNumber(value);
>>>>>>> origin/main
            where[field] = { ...where[field], gt: numericValue ?? value };
          } else if (key.endsWith('_lt')) {
            // Less than filter
            const field = key.replace('_lt', '');
<<<<<<< HEAD
            // Only convert to number if the field likely contains numeric data
            const numericValue = this.shouldConvertToNumber(field, value) ? this.convertToNumber(value) : null;
=======
            const numericValue = this.convertToNumber(value);
>>>>>>> origin/main
            where[field] = { ...where[field], lt: numericValue ?? value };
          } else if (key.endsWith('_in')) {
            // In array filter
            const field = key.replace('_in', '');
            where[field] = { in: Array.isArray(value) ? value : [value] };
          } else if (key.endsWith('_contains')) {
<<<<<<< HEAD
            // Text contains filter (PostgreSQL supports case insensitive search)
=======
            // Text contains filter (SQLite doesn't support mode: 'insensitive')
>>>>>>> origin/main
            const field = key.replace('_contains', '');
            where[field] = { contains: value };
          } else if (Array.isArray(value)) {
            // Array filter (e.g., status in ['ACTIVE', 'PENDING'])
            where[key] = { in: value };
          } else if (typeof value === 'object' && value !== null) {
<<<<<<< HEAD
            // Check if it's a date string that got parsed incorrectly
            if (this.isDateStringObject(value)) {
              // Reconstruct the date string from the character object
              const dateStr = this.reconstructDateString(value);
              where[key] = dateStr;
            } else {
              // Handle complex filter objects like { $contains: "value" }
              this.buildComplexFilter(where, key, value);
            }
=======
            // Handle complex filter objects like { $contains: "value" }
            this.buildComplexFilter(where, key, value);
>>>>>>> origin/main
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
   * Build complex filter objects like { $contains: "value" }
   */
  protected buildComplexFilter(where: any, key: string, value: any): void {
    try {
      if (value.$contains !== undefined) {
<<<<<<< HEAD
        // PostgreSQL supports case insensitive search with ilike
        // Use case-insensitive contains without the mode option
        where[key] = { contains: value.$contains };
      } else if (value.$gte !== undefined) {
        const numericValue = this.shouldConvertToNumber(key, value.$gte) ? this.convertToNumber(value.$gte) : null;
        where[key] = { ...where[key], gte: numericValue ?? value.$gte };
      } else if (value.$lte !== undefined) {
        const numericValue = this.shouldConvertToNumber(key, value.$lte) ? this.convertToNumber(value.$lte) : null;
        where[key] = { ...where[key], lte: numericValue ?? value.$lte };
      } else if (value.$gt !== undefined) {
        const numericValue = this.shouldConvertToNumber(key, value.$gt) ? this.convertToNumber(value.$gt) : null;
        where[key] = { ...where[key], gt: numericValue ?? value.$gt };
      } else if (value.$lt !== undefined) {
        const numericValue = this.shouldConvertToNumber(key, value.$lt) ? this.convertToNumber(value.$lt) : null;
        where[key] = { ...where[key], lt: numericValue ?? value.$lt };
=======
        // SQLite doesn't support 'mode: insensitive' for contains
        // Use case-insensitive contains without the mode option
        where[key] = { contains: value.$contains };
      } else if (value.$gte !== undefined) {
        where[key] = { ...where[key], gte: this.convertToNumber(value.$gte) ?? value.$gte };
      } else if (value.$lte !== undefined) {
        where[key] = { ...where[key], lte: this.convertToNumber(value.$lte) ?? value.$lte };
      } else if (value.$gt !== undefined) {
        where[key] = { ...where[key], gt: this.convertToNumber(value.$gt) ?? value.$gt };
      } else if (value.$lt !== undefined) {
        where[key] = { ...where[key], lt: this.convertToNumber(value.$lt) ?? value.$lt };
>>>>>>> origin/main
      } else if (value.$in !== undefined) {
        where[key] = { in: Array.isArray(value.$in) ? value.$in : [value.$in] };
      } else if (value.$ne !== undefined) {
        where[key] = { not: value.$ne };
      } else {
        // Range filter object with direct operators
        where[key] = value;
      }
    } catch (error) {
      console.error(`Error in buildComplexFilter for ${key}:`, error);
      throw error;
    }
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
<<<<<<< HEAD
      
      // Handle nested sorting (e.g., "class.gradeLevel" or "section.class.gradeLevel")
      if (fieldName.includes('.')) {
        const parts = fieldName.split('.');
        const direction = isDesc ? 'desc' : 'asc';
        
        // Build nested object recursively
        let orderByObj: any = { [parts[parts.length - 1]]: direction };
        
        for (let i = parts.length - 2; i >= 0; i--) {
          orderByObj = { [parts[i]]: orderByObj };
        }
        
        return orderByObj;
      }
      
=======
>>>>>>> origin/main
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
   * Override in specific services if they support soft delete
   * Returns true if the model has deletedAt field
   */
  protected supportsSoftDelete(): boolean {
    // Models with soft delete support
    const softDeleteModels = [
      'student',
      'guardian',
      'invoice',
      'payment',
      'staff',
      'teacher',
    ];
    return softDeleteModels.includes(this.modelName.toLowerCase());
  }

  /**
   * Restore soft-deleted item
   * Returns: { data: T } (the restored item)
   */
  async restore(id: string): Promise<SingleResponse<T>> {
    if (!this.supportsSoftDelete()) {
      throw new BadRequestException(`${this.modelName} does not support soft delete`);
    }

    try {
      const restored = await (this.prisma as any)[this.modelName].update({
        where: { id },
        data: {
          deletedAt: null,
          deletedBy: null,
        },
      });

      return { data: restored };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`${this.modelName} not found`);
      }
      throw error;
    }
  }

  /**
   * Get deleted items (soft deleted only)
   * Returns: { data: T[], total: number }
   */
  async getDeleted(params: ListParams): Promise<ListResponse<T>> {
    if (!this.supportsSoftDelete()) {
      return { data: [], total: 0 };
    }

    const page = Math.max(1, Number(params.page ?? 1));
    const perPage = Math.min(100, Math.max(1, Number(params.perPage ?? 25)));
    const skip = (page - 1) * perPage;

    // Build where clause for deleted items
    const where = {
      ...this.buildWhereClause(params.filter),
      deletedAt: { not: null },
    };

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
<<<<<<< HEAD
   * Determine if a field value should be converted to a number
   */
  private shouldConvertToNumber(field: string, value: any): boolean {
    // Don't convert if value is already a number
    if (typeof value === 'number') return false;
    
    // Don't convert if value doesn't look like a number
    if (typeof value === 'string' && isNaN(parseInt(value, 10))) return false;
    
    // Known date/time fields should not be converted to numbers
    const dateFields = ['date', 'duedate', 'createdat', 'updatedat', 'deletedat', 'dob', 'startedat', 'endedat', 'timestamp'];
    if (dateFields.some(df => field.toLowerCase().includes(df))) return false;
    
    // Fields that typically contain numeric data
    const numericFields = ['amount', 'price', 'cost', 'fee', 'salary', 'age', 'gradelevel', 'level', 'count', 'total', 'sum'];
    if (numericFields.some(nf => field.toLowerCase().includes(nf))) return true;
    
    // ID fields should not be converted (they're UUIDs)
    if (field.toLowerCase().endsWith('id')) return false;
    
    // Default to not converting for safety
    return false;
  }

  /**
=======
>>>>>>> origin/main
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
<<<<<<< HEAD

  /**
   * Check if an object looks like a date string that was incorrectly parsed into character indices
   */
  private isDateStringObject(value: any): boolean {
    if (typeof value !== 'object' || value === null) return false;
    
    // Check if object has numeric string keys (0, 1, 2, etc.) which suggests string indexing
    const keys = Object.keys(value);
    const hasNumericKeys = keys.some(key => /^\d+$/.test(key));
    
    // Also check if it has other properties that might indicate it's a valid filter object
    const hasFilterProps = keys.some(key => 
      ['gte', 'lte', 'gt', 'lt', 'equals', 'in', 'not', 'contains'].includes(key)
    );
    
    return hasNumericKeys && !hasFilterProps;
  }

  /**
   * Reconstruct date string from character indices object
   */
  private reconstructDateString(value: any): string {
    try {
      const keys = Object.keys(value).filter(key => /^\d+$/.test(key)).sort((a, b) => parseInt(a) - parseInt(b));
      let reconstructed = '';
      
      for (const key of keys) {
        reconstructed += value[key];
      }
      
      // Validate that it looks like a date
      if (/^\d{4}-\d{2}-\d{2}/.test(reconstructed)) {
        return reconstructed;
      }
      
      // If reconstruction failed, try to find a valid date among other properties
      for (const [key, val] of Object.entries(value)) {
        if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
          return val;
        }
      }
      
      return reconstructed; // Return whatever we reconstructed as fallback
    } catch (error) {
      console.warn('Failed to reconstruct date string:', error);
      return '';
    }
  }
=======
>>>>>>> origin/main
}