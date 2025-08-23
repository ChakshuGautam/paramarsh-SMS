import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseCrudService } from '../../common/base-crud.service';

@Injectable()
export class AuditLogsService extends BaseCrudService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, 'auditLog');
  }

  /**
   * Get audit logs for a specific entity
   */
  async getEntityLogs(entityType: string, entityId: string, params?: any) {
    const page = Math.max(1, Number(params?.page ?? 1));
    const perPage = Math.min(100, Math.max(1, Number(params?.perPage ?? 25)));
    const skip = (page - 1) * perPage;

    const where = {
      entityType,
      entityId,
    };

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserLogs(userId: string, params?: any) {
    const page = Math.max(1, Number(params?.page ?? 1));
    const perPage = Math.min(100, Math.max(1, Number(params?.perPage ?? 25)));
    const skip = (page - 1) * perPage;

    const where = { userId };

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Get audit logs for a specific branch
   */
  async getBranchLogs(branchId: string, params?: any) {
    const page = Math.max(1, Number(params?.page ?? 1));
    const perPage = Math.min(100, Math.max(1, Number(params?.perPage ?? 25)));
    const skip = (page - 1) * perPage;

    const where = { branchId };

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Get audit logs by action type
   */
  async getActionLogs(action: string, params?: any) {
    const page = Math.max(1, Number(params?.page ?? 1));
    const perPage = Math.min(100, Math.max(1, Number(params?.perPage ?? 25)));
    const skip = (page - 1) * perPage;

    const where = { action };

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Get failed requests
   */
  async getFailedRequests(params?: any) {
    const page = Math.max(1, Number(params?.page ?? 1));
    const perPage = Math.min(100, Math.max(1, Number(params?.perPage ?? 25)));
    const skip = (page - 1) * perPage;

    const where = {
      errorMessage: { not: null },
    };

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(startDate?: Date, endDate?: Date) {
    const where: any = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const metrics = await this.prisma.auditLog.aggregate({
      where,
      _avg: { duration: true },
      _max: { duration: true },
      _min: { duration: true },
      _count: true,
    });

    // Get slow requests (> 1000ms)
    const slowRequests = await this.prisma.auditLog.count({
      where: {
        ...where,
        duration: { gt: 1000 },
      },
    });

    // Get error rate
    const errorCount = await this.prisma.auditLog.count({
      where: {
        ...where,
        errorMessage: { not: null },
      },
    });

    return {
      data: {
        averageDuration: metrics._avg.duration || 0,
        maxDuration: metrics._max.duration || 0,
        minDuration: metrics._min.duration || 0,
        totalRequests: metrics._count,
        slowRequests,
        errorCount,
        errorRate: metrics._count > 0 ? (errorCount / metrics._count) * 100 : 0,
      },
    };
  }

  protected supportsBranchScoping(): boolean {
    return true;
  }

  protected buildSearchClause(search: string): any[] {
    return [
      { endpoint: { contains: search } },
      { userEmail: { contains: search } },
      { entityType: { contains: search } },
      { action: { contains: search } },
      { errorMessage: { contains: search } },
    ];
  }
}