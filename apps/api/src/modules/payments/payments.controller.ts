import { Controller, Get, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('fees/payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get()
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('status') status?: string,
    @Query('method') method?: string,
  ) {
    return this.service.list({ page, pageSize, sort, status, method });
  }
}
