import { Controller, Get, Query } from '@nestjs/common';
import { FeeStructuresService } from './fee-structures.service';

@Controller('fees/structures')
export class FeeStructuresController {
  constructor(private readonly service: FeeStructuresService) {}

  @Get()
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
  ) {
    return this.service.list({ page, pageSize, sort });
  }
}
