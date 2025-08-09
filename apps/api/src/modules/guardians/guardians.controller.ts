import { Controller, Get, Query } from '@nestjs/common';
import { GuardiansService } from './guardians.service';

@Controller('guardians')
export class GuardiansController {
  constructor(private readonly service: GuardiansService) {}

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
