import { Controller, Query, Headers } from '@nestjs/common';
import { DEFAULT_BRANCH_ID, BRANCH_HEADER_KEY, DEFAULT_PAGE_SIZE } from './constants';

/**
 * Base controller utilities for consistent request handling
 * Eliminates duplicate query parsing and header handling logic
 */

export interface ParsedQuery {
  filter: Record<string, any>;
  sort: { field: string; order: 'ASC' | 'DESC' };
  pagination: { start: number; limit: number };
  range: [number, number];
}

/**
 * Base class for all controllers with common functionality
 */
export abstract class BaseController {
  /**
   * Parse React Admin query parameters consistently
   */
  protected parseQuery(
    rangeStr?: string,
    sortStr?: string,
    filterStr?: string
  ): ParsedQuery {
    // Parse range/pagination
    let start = 0;
    let limit = DEFAULT_PAGE_SIZE;
    let range: [number, number] = [0, DEFAULT_PAGE_SIZE];
    
    if (rangeStr) {
      try {
        const parsed = JSON.parse(rangeStr);
        if (Array.isArray(parsed) && parsed.length === 2) {
          range = [parsed[0], parsed[1]];
          start = parsed[0];
          limit = parsed[1] - parsed[0];
        }
      } catch {
        // Use defaults
      }
    }

    // Parse sort
    let sort: { field: string; order: 'ASC' | 'DESC' } = { field: 'id', order: 'ASC' };
    if (sortStr) {
      try {
        const parsed = JSON.parse(sortStr);
        if (Array.isArray(parsed) && parsed.length === 2) {
          sort = {
            field: parsed[0] || 'id',
            order: (parsed[1] === 'DESC' ? 'DESC' : 'ASC') as 'ASC' | 'DESC',
          };
        }
      } catch {
        // Use defaults
      }
    }

    // Parse filter
    let filter = {};
    if (filterStr) {
      try {
        const parsed = JSON.parse(filterStr);
        if (typeof parsed === 'object' && parsed !== null) {
          filter = parsed;
        }
      } catch {
        // Use defaults
      }
    }

    return {
      filter,
      sort,
      pagination: { start, limit },
      range,
    };
  }

  /**
   * Format response for React Admin
   */
  protected formatResponse<T>(data: T | T[], total?: number) {
    return { data, total };
  }

  /**
   * Extract branch ID from headers with default fallback
   */
  protected getBranchId(branchId?: string): string {
    return branchId || DEFAULT_BRANCH_ID;
  }

  /**
   * Build where clause for Prisma queries with multi-tenancy
   */
  protected buildWhereClause(
    branchId: string,
    filter: Record<string, any> = {},
    additionalWhere: Record<string, any> = {}
  ) {
    const where: any = {
      branchId,
      deletedAt: null, // Soft delete filter
      ...additionalWhere,
    };

    // Handle common filter patterns
    if (filter.q) {
      // Search query - should be customized per entity
      where.OR = this.buildSearchConditions(filter.q);
    }

    // Handle other filters
    Object.keys(filter).forEach(key => {
      if (key === 'q') return; // Already handled
      
      // Handle special filter operators
      if (key.endsWith('_gte')) {
        const field = key.replace('_gte', '');
        where[field] = { gte: filter[key] };
      } else if (key.endsWith('_lte')) {
        const field = key.replace('_lte', '');
        where[field] = { ...where[field], lte: filter[key] };
      } else if (key.endsWith('_in')) {
        const field = key.replace('_in', '');
        where[field] = { in: filter[key] };
      } else if (key.endsWith('_contains')) {
        const field = key.replace('_contains', '');
        where[field] = { contains: filter[key], mode: 'insensitive' };
      } else {
        where[key] = filter[key];
      }
    });

    return where;
  }

  /**
   * Override this method in derived controllers to provide entity-specific search
   */
  protected buildSearchConditions(query: string): any[] {
    // Default implementation - override in derived classes
    return [];
  }

  /**
   * Build order by clause for Prisma
   */
  protected buildOrderBy(sort: { field: string; order: 'ASC' | 'DESC' }) {
    return { [sort.field]: sort.order.toLowerCase() };
  }

  /**
   * Set response headers for React Admin
   */
  protected setResponseHeaders(res: any, total: number, range: [number, number]) {
    res.header('Content-Range', `items ${range[0]}-${range[1]}/${total}`);
    res.header('Access-Control-Expose-Headers', 'Content-Range');
  }
}

/**
 * Decorator to standardize branch ID parameter
 */
export function BranchId() {
  return Headers(BRANCH_HEADER_KEY);
}

/**
 * Decorator to parse React Admin query parameters
 */
export function ReactAdminQuery() {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      // Extract query parameters from the first argument that has them
      const queryArg = args.find(arg => 
        arg && typeof arg === 'object' && 
        ('range' in arg || 'sort' in arg || 'filter' in arg)
      );
      
      if (queryArg) {
        const parsed = this.parseQuery(queryArg.range, queryArg.sort, queryArg.filter);
        queryArg.parsed = parsed;
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * Interface for consistent CRUD operations
 */
export interface ICrudController<T> {
  findAll(
    range?: string,
    sort?: string,
    filter?: string,
    branchId?: string,
    res?: any
  ): Promise<{ data: T[]; total: number }>;

  findOne(
    id: string,
    branchId?: string
  ): Promise<{ data: T }>;

  create(
    createDto: any,
    branchId?: string
  ): Promise<{ data: T }>;

  update(
    id: string,
    updateDto: any,
    branchId?: string
  ): Promise<{ data: T }>;

  remove(
    id: string,
    branchId?: string
  ): Promise<{ data: T }>;
}