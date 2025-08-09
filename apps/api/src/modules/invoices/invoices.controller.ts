import { Controller, Get, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';

@Controller('fees/invoices')
export class InvoicesController {
  constructor(private readonly service: InvoicesService) {}

  @Get()
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('studentAdmissionNo') studentAdmissionNo?: string,
    @Query('status') status?: string,
  ) {
    return this.service.list({ page, pageSize, sort, studentAdmissionNo, status });
  }
}
