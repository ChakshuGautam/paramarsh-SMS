import { Controller, Get, Query } from '@nestjs/common';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly service: StudentsService) {}

  @Get()
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('q') q?: string,
    @Query('className') className?: string,
    @Query('sectionName') sectionName?: string,
  ) {
    return this.service.list({ page, pageSize, sort, q, className, sectionName });
  }
}
