import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { ProblemDto } from '../../common/problem.dto';
import { CreateDocs, DeleteDocs, ListDocs, UpdateDocs } from '../../common/swagger.decorators';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './types/create-student.dto';
import { UpdateStudentDto } from './types/update-student.dto';

@ApiTags('Students')
@Controller('students')
export class StudentsController {
  constructor(private readonly service: StudentsService) {}

  @Get()
  @ListDocs('List students')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'className', required: false })
  @ApiQuery({ name: 'sectionName', required: false })
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
  @CreateDocs('Create student')
  create(@Body() body: CreateStudentDto) {
    return this.service.create(body);
  }

  @Patch(':id')
  @UpdateDocs('Update student')
  update(@Param('id') id: string, @Body() body: UpdateStudentDto) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @DeleteDocs('Delete student')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
