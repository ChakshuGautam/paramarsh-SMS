import { Injectable, OnModuleDestroy, OnModuleInit, Scope } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

type RequestScope = { tenantId?: string; branchId?: string };
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
}
