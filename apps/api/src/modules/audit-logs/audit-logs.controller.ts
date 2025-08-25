<<<<<<< HEAD
import { DEFAULT_BRANCH_ID } from '../../common/constants';
=======
>>>>>>> origin/main
import {
  Controller,
  Get,
  Query,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { ListParams } from '../../common/base-crud.service';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';

<<<<<<< HEAD
@Controller('audit-logs')
=======
@Controller('api/v1/audit-logs')
>>>>>>> origin/main
@UseInterceptors(AuditLogInterceptor)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  async getList(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('sort') sort?: string,
    @Query('filter') filter?: string,
  ) {
    const params: ListParams = {
      page: page ? parseInt(page, 10) : 1,
      perPage: perPage ? parseInt(perPage, 10) : 25,
      sort,
      filter: filter ? JSON.parse(filter) : {},
    };

    return this.auditLogsService.getList(params);
  }

  @Get('entity/:entityType/:entityId')
  async getEntityLogs(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    const params = {
      page: page ? parseInt(page, 10) : 1,
      perPage: perPage ? parseInt(perPage, 10) : 25,
    };

    return this.auditLogsService.getEntityLogs(entityType, entityId, params);
  }

  @Get('user/:userId')
  async getUserLogs(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    const params = {
      page: page ? parseInt(page, 10) : 1,
      perPage: perPage ? parseInt(perPage, 10) : 25,
    };

    return this.auditLogsService.getUserLogs(userId, params);
  }

  @Get('branch/:branchId')
  async getBranchLogs(
    @Param('branchId') branchId: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    const params = {
      page: page ? parseInt(page, 10) : 1,
      perPage: perPage ? parseInt(perPage, 10) : 25,
    };

    return this.auditLogsService.getBranchLogs(branchId, params);
  }

  @Get('action/:action')
  async getActionLogs(
    @Param('action') action: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    const params = {
      page: page ? parseInt(page, 10) : 1,
      perPage: perPage ? parseInt(perPage, 10) : 25,
    };

    return this.auditLogsService.getActionLogs(action, params);
  }

  @Get('failed')
  async getFailedRequests(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    const params = {
      page: page ? parseInt(page, 10) : 1,
      perPage: perPage ? parseInt(perPage, 10) : 25,
    };

    return this.auditLogsService.getFailedRequests(params);
  }

  @Get('metrics')
  async getPerformanceMetrics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.auditLogsService.getPerformanceMetrics(start, end);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.auditLogsService.getOne(id);
  }
}