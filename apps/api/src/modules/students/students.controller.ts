import { DEFAULT_BRANCH_ID } from '../../common/constants';
import { Controller, Get, Post, Put, Delete, Param, Query, Body, Headers } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from '../../common/base-crud.controller';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './types/create-student.dto';
import { UpdateStudentDto } from './types/update-student.dto';

@ApiTags('Students')
@Controller('students')
export class StudentsController extends BaseCrudController<any> {
  constructor(protected readonly studentsService: StudentsService) {
    super(studentsService);
  }

  // Use the base controller's getList method by default
  // Only override if you need special handling

  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.studentsService.getOne(id, branchId);
  }

  @Post()
  async create(
    @Body() data: CreateStudentDto,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.studentsService.create({ ...data, branchId });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateStudentDto,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    // First check if the student exists in this branch
    await this.studentsService.getOne(id, branchId);
    return this.studentsService.update(id, { ...data, branchId });
  }

  @Get('deleted')
  async getDeleted(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('sort') sort?: string,
    @Query('filter') filterStr?: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    let filter = {};
    if (filterStr) {
      try {
        filter = typeof filterStr === 'string' ? JSON.parse(filterStr) : filterStr;
      } catch (e) {
        filter = {};
      }
    }
    
    return this.studentsService.getDeleted({
      page: page ? Number(page) : 1,
      perPage: perPage ? Number(perPage) : 25,
      sort,
      filter: { ...filter, branchId },
    });
  }

  @Post(':id/restore')
  async restore(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    // First check if the student exists in this branch
    await this.studentsService.getOne(id, branchId);
    return this.studentsService.restore(id);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
    @Headers('x-user-id') userId?: string,
  ) {
    // First check if the student exists in this branch
    await this.studentsService.getOne(id, branchId);
    return this.studentsService.delete(id);
  }
}