import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './types/create-student.dto';
import { UpdateStudentDto } from './types/update-student.dto';

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

  @Post()
  create(@Body() body: CreateStudentDto) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateStudentDto) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
