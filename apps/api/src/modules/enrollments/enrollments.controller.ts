import { Controller, Get, Query } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly service: EnrollmentsService) {}

  @Get()
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('className') className?: string,
    @Query('sectionName') sectionName?: string,
    @Query('status') status?: string,
  ) {
    return this.service.list({ page, pageSize, sort, className, sectionName, status });
  }
}
