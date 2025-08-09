import { Controller, Get, Query } from '@nestjs/common';
import { StaffService } from './staff.service';

@Controller('hr/staff')
export class StaffController {
  constructor(private readonly service: StaffService) {}

  @Get()
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('department') department?: string,
    @Query('status') status?: string,
  ) {
    return this.service.list({ page, pageSize, sort, department, status });
  }
}
