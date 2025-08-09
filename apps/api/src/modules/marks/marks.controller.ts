import { Controller, Get, Query } from '@nestjs/common';
import { MarksService } from './marks.service';

@Controller('marks')
export class MarksController {
  constructor(private readonly service: MarksService) {}

  @Get()
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('studentAdmissionNo') studentAdmissionNo?: string,
    @Query('examName') examName?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.service.list({ page, pageSize, sort, studentAdmissionNo, examName, subjectId });
  }
}
