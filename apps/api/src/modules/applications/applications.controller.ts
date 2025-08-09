import { Controller, Get, Query } from '@nestjs/common';
import { ApplicationsService } from './applications.service';

@Controller('admissions/applications')
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Get()
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('status') status?: string,
    @Query('tenantSubdomain') tenantSubdomain?: string,
  ) {
    return this.service.list({ page, pageSize, sort, status, tenantSubdomain });
  }
}
