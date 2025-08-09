import { Controller, Get, Query } from '@nestjs/common';
import { ClassesService } from './classes.service';

@Controller('classes')
export class ClassesController {
  constructor(private readonly service: ClassesService) {}

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
