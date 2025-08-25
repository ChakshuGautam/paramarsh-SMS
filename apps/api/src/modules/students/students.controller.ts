import { Controller, Get, Post, Put, Delete, Param, Query, Body, Headers } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from '../../common/base-crud.controller';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './types/create-student.dto';
import { UpdateStudentDto } from './types/update-student.dto';

@ApiTags('Students')
@Controller('students')
export class StudentsController extends BaseCrudController<any> {
  constructor(private readonly studentsService: StudentsService) {
    super(studentsService);
  }

  @Get()
  async getList(
    @Query('ids') ids?: string | string[],
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sort') sort?: string,
    @Query() query?: Record<string, any>,
    @Headers('x-branch-id') branchId = 'branch1',
  ) {
    // Handle getMany case (when ids are provided)
    if (ids) {
      const idArray = Array.isArray(ids) ? ids : (typeof ids === 'string' ? ids.split(',') : [ids]);
      return this.studentsService.getMany(idArray, branchId);
    }
    
    // Remove pagination params from query to get filters
    const { page: _p, perPage: _pp, pageSize: _ps, sort: _s, filter: filterStr, ...restQuery } = query || {};
    
    // Parse filter if it's a JSON string
    let filter = {};
    if (filterStr) {
      try {
        filter = typeof filterStr === 'string' ? JSON.parse(filterStr) : filterStr;
      } catch (e) {
        // If parsing fails, treat as empty filter
        filter = {};
      }
    }
    
    // Merge any remaining query params as filters
    filter = { ...filter, ...restQuery };
    
    return this.studentsService.getList({
      page: page ? Number(page) : 1,
      perPage: perPage ? Number(perPage) : (pageSize ? Number(pageSize) : 25),
      sort,
      filter,
      branchId, // Pass branchId to service
    });
  }

  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = 'branch1',
  ) {
    return this.studentsService.getOne(id, branchId);
  }

  @Post()
  async create(
    @Body() data: CreateStudentDto,
    @Headers('x-branch-id') branchId = 'branch1',
  ) {
    return this.studentsService.create({ ...data, branchId });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateStudentDto,
    @Headers('x-branch-id') branchId = 'branch1',
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
    @Headers('x-branch-id') branchId = 'branch1',
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
    @Headers('x-branch-id') branchId = 'branch1',
  ) {
    // First check if the student exists in this branch
    await this.studentsService.getOne(id, branchId);
    return this.studentsService.restore(id);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = 'branch1',
    @Headers('x-user-id') userId?: string,
  ) {
    // First check if the student exists in this branch
    await this.studentsService.getOne(id, branchId);
    return this.studentsService.delete(id);
  }
}