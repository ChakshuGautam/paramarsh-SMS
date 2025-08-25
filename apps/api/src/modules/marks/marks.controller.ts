import { DEFAULT_BRANCH_ID } from '../../common/constants';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MarksService } from './marks.service';
import { CreateDocs, DeleteDocs, ListDocs, UpdateDocs } from '../../common/swagger.decorators';
import { CreateMarkDto } from './dto/create-mark.dto';
import { UpdateMarkDto } from './dto/update-mark.dto';

@ApiTags('Marks')
@Controller('marks')
export class MarksController {
  constructor(private readonly service: MarksService) {}

  @Get()
  @ListDocs('List marks')
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (starts from 1)' })
  @ApiQuery({ name: 'perPage', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of items per page (alias for perPage)' })
  @ApiQuery({ name: 'q', required: false, description: 'Search by student or subject name' })
  @ApiQuery({ name: 'examId', required: false, description: 'Filter by exam ID' })
  @ApiQuery({ name: 'subjectId', required: false, description: 'Filter by subject ID' })
  @ApiQuery({ name: 'studentId', required: false, description: 'Filter by student ID' })
  @ApiQuery({ name: 'isAbsent', required: false, type: Boolean, description: 'Filter by absence status' })
  list(
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('pageSize') pageSize?: number, // Keep for backward compatibility
    @Query('sort') sort?: string,
    @Query('q') q?: string,
    @Query('examId') examId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('studentId') studentId?: string,
    @Query('isAbsent') isAbsent?: boolean,
  ) {
    const effectivePerPage = perPage || pageSize;
    return this.service.list({ page, perPage: effectivePerPage, sort, q, examId, subjectId, studentId, isAbsent });
  }

  @Get(':id')
  @ListDocs('Get single mark entry')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @CreateDocs('Create marks entry')
  create(@Body() body: CreateMarkDto) {
    return this.service.create(body);
  }

  @Patch(':id')
  @UpdateDocs('Update marks entry')
  update(@Param('id') id: string, @Body() body: UpdateMarkDto) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @DeleteDocs('Delete marks entry')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // Bulk operations
  @Post('bulk/:examId/:subjectId')
  @CreateDocs('Bulk create/update marks for an exam-subject combination')
  bulkCreate(
    @Param('examId') examId: string,
    @Param('subjectId') subjectId: string,
    @Body() marks: CreateMarkDto[]
  ) {
    return this.service.bulkCreate(examId, subjectId, marks);
  }

  // Get marks for an exam
  @Get('exam/:examId')
  @ListDocs('Get all marks for a specific exam')
  getExamMarks(@Param('examId') examId: string) {
    return this.service.getExamMarks(examId);
  }

  // Get marks for a student
  @Get('student/:studentId')
  @ListDocs('Get all marks for a specific student')
  getStudentMarks(@Param('studentId') studentId: string) {
    return this.service.getStudentMarks(studentId);
  }
}