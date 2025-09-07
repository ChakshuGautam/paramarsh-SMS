import { DEFAULT_BRANCH_ID } from '../../common/constants';
import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { CreateDocs, DeleteDocs, ListDocs, UpdateDocs } from '../../common/swagger.decorators';

@ApiTags('Teachers')
@Controller('teachers')
export class TeachersController {
  constructor(private readonly service: TeachersService) {}

  @Get()
  @ListDocs('List teachers')
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (starts from 1)' })
  @ApiQuery({ name: 'perPage', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of items per page (alias for perPage)' })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'filter', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'ids', required: false })
  list(
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('pageSize') pageSize?: number, // Keep for backward compatibility
    @Query('sort') sort?: string,
    @Query('filter') filter?: string,
    @Query('q') q?: string,
    @Query('ids') ids?: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    const parsedFilter = filter ? JSON.parse(filter) : {};
    const idsArray = ids ? ids.split(',') : undefined;
    const effectivePerPage = perPage || pageSize;
    
    if (idsArray) {
      return this.service.getMany(idsArray, branchId);
    }
    
    return this.service.getList({ page, perPage: effectivePerPage, sort, filter: parsedFilter, q, branchId });
  }

  @Post()
  @CreateDocs('Create teacher')
  create(
    @Body() body: any,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
  ) {
    return this.service.create({ ...body, branchId });
  }

  @Get(':id')
  getOne(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
  ) {
    return this.service.getOne(id, branchId);
  }

  @Put(':id')
  @UpdateDocs('Update teacher')
  update(
    @Param('id') id: string, 
    @Body() body: any,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
  ) {
    return this.service.update(id, { ...body, branchId });
  }

  @Patch(':id')
  @UpdateDocs('Partially update teacher')
  partialUpdate(
    @Param('id') id: string, 
    @Body() body: any,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
  ) {
    return this.service.update(id, { ...body, branchId });
  }

  @Delete(':id')
  @DeleteDocs('Delete teacher')
  remove(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
  ) {
    return this.service.delete(id);
  }

  // Teacher class/section assignment endpoints
  @Get(':id/assignments')
  getTeacherAssignments(
    @Param('id') teacherId: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
  ) {
    return this.service.getTeacherAssignments(teacherId, branchId);
  }

  @Get(':id/sections')
  getTeacherSections(
    @Param('id') teacherId: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
  ) {
    return this.service.getTeacherSections(teacherId, branchId);
  }

  @Post(':id/assignments')
  assignToClass(
    @Param('id') teacherId: string,
    @Body() body: { classId: string; subjectId: string },
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
  ) {
    return this.service.assignToClass(teacherId, body.classId, body.subjectId, branchId);
  }

  @Delete(':id/assignments/:classId/:subjectId')
  removeFromClass(
    @Param('id') teacherId: string,
    @Param('classId') classId: string,
    @Param('subjectId') subjectId: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
  ) {
    return this.service.removeFromClass(teacherId, classId, subjectId, branchId);
  }
}