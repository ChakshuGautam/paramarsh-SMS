<<<<<<< HEAD
import { DEFAULT_BRANCH_ID } from '../../common/constants';
=======
>>>>>>> origin/main
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
<<<<<<< HEAD
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (starts from 1)' })
  @ApiQuery({ name: 'perPage', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of items per page (alias for perPage)' })
=======
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
>>>>>>> origin/main
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'filter', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'ids', required: false })
  list(
    @Query('page') page?: number,
<<<<<<< HEAD
    @Query('perPage') perPage?: number,
    @Query('pageSize') pageSize?: number, // Keep for backward compatibility
=======
    @Query('pageSize') pageSize?: number,
>>>>>>> origin/main
    @Query('sort') sort?: string,
    @Query('filter') filter?: string,
    @Query('q') q?: string,
    @Query('ids') ids?: string,
<<<<<<< HEAD
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    const parsedFilter = filter ? JSON.parse(filter) : {};
    const idsArray = ids ? ids.split(',') : undefined;
    const effectivePerPage = perPage || pageSize;
=======
    @Headers('x-branch-id') branchId = 'branch1',
  ) {
    const parsedFilter = filter ? JSON.parse(filter) : {};
    const idsArray = ids ? ids.split(',') : undefined;
>>>>>>> origin/main
    
    if (idsArray) {
      return this.service.getMany(idsArray, branchId);
    }
    
<<<<<<< HEAD
    return this.service.getList({ page, perPage: effectivePerPage, sort, filter: parsedFilter, q, branchId });
=======
    return this.service.getList({ page, pageSize, sort, filter: parsedFilter, q, branchId });
>>>>>>> origin/main
  }

  @Post()
  @CreateDocs('Create teacher')
  create(
    @Body() body: any,
<<<<<<< HEAD
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
=======
    @Headers('x-branch-id') branchId = 'branch1'
>>>>>>> origin/main
  ) {
    return this.service.create({ ...body, branchId });
  }

  @Get(':id')
  getOne(
    @Param('id') id: string,
<<<<<<< HEAD
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
=======
    @Headers('x-branch-id') branchId = 'branch1'
>>>>>>> origin/main
  ) {
    return this.service.getOne(id, branchId);
  }

  @Put(':id')
  @UpdateDocs('Update teacher')
  update(
    @Param('id') id: string, 
    @Body() body: any,
<<<<<<< HEAD
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
=======
    @Headers('x-branch-id') branchId = 'branch1'
>>>>>>> origin/main
  ) {
    return this.service.update(id, { ...body, branchId });
  }

  @Patch(':id')
  @UpdateDocs('Partially update teacher')
  partialUpdate(
    @Param('id') id: string, 
    @Body() body: any,
<<<<<<< HEAD
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
=======
    @Headers('x-branch-id') branchId = 'branch1'
>>>>>>> origin/main
  ) {
    return this.service.update(id, { ...body, branchId });
  }

  @Delete(':id')
  @DeleteDocs('Delete teacher')
  remove(
    @Param('id') id: string,
<<<<<<< HEAD
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
=======
    @Headers('x-branch-id') branchId = 'branch1'
>>>>>>> origin/main
  ) {
    return this.service.delete(id);
  }
}