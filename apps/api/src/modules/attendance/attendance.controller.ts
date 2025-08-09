import { Controller, Get, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance/records')
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Get()
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('studentAdmissionNo') studentAdmissionNo?: string,
  ) {
    return this.service.list({ page, pageSize, sort, studentAdmissionNo });
  }
}
