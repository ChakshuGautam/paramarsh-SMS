import { Injectable, OnModuleDestroy, OnModuleInit, Scope } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

/**
 * RequestScope for multi-tenant/multi-school architecture
 * 
 * TERMINOLOGY:
 * - tenantId: Organization or school district level identifier
 * - branchId: Individual school identifier (referred to as "schoolId" in API layer)
 * 
 * Note: "branchId" is the database field name, but it represents a school.
 * All API endpoints should use "schoolId" for clarity.
 */
type RequestScope = { 
  tenantId?: string; 
  branchId?: string;  // This is actually the schoolId - aliased for API clarity
};
const requestStore = new AsyncLocalStorage<RequestScope>();

@Injectable({ scope: Scope.DEFAULT })
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Accessors for request-scoped tenancy
  static runWithScope<T>(scope: RequestScope, fn: () => Promise<T> | T): Promise<T> | T {
    return requestStore.run(scope, fn as any) as any;
  }

  static getScope(): RequestScope {
    return requestStore.getStore() ?? {};
  }

  /**
   * Get the current school ID from the request scope
   * This is an alias for branchId for better API clarity
   */
  static getSchoolId(): string | undefined {
    return requestStore.getStore()?.branchId;
  }

  /**
   * Run a function in a specific school's scope
   * @param schoolId The school identifier (maps to branchId internally)
   * @param fn The function to execute
   */
  static runInSchoolScope<T>(schoolId: string, fn: () => Promise<T> | T): Promise<T> | T {
    return requestStore.run({ branchId: schoolId }, fn as any) as any;
  }
}
