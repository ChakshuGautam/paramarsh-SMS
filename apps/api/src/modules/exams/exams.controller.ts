import { Controller, Get, Query } from '@nestjs/common';
import { ExamsService } from './exams.service';

@Controller('exams')
export class ExamsController {
  constructor(private readonly service: ExamsService) {}

  @Get()
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('q') q?: string,
  ) {
    return this.service.list({ page, pageSize, sort, q });
  }
}
