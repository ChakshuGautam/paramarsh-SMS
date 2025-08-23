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
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'filter', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'ids', required: false })
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('filter') filter?: string,
    @Query('q') q?: string,
    @Query('ids') ids?: string,
    @Headers('x-branch-id') branchId = 'branch1',
  ) {
    const parsedFilter = filter ? JSON.parse(filter) : {};
    const idsArray = ids ? ids.split(',') : undefined;
    
    if (idsArray) {
      return this.service.getMany(idsArray, branchId);
    }
    
    return this.service.getList({ page, pageSize, sort, filter: parsedFilter, q, branchId });
  }

  @Post()
  @CreateDocs('Create teacher')
  create(
    @Body() body: any,
    @Headers('x-branch-id') branchId = 'branch1'
  ) {
    return this.service.create({ ...body, branchId });
  }

  @Get(':id')
  getOne(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = 'branch1'
  ) {
    return this.service.getOne(id, branchId);
  }

  @Put(':id')
  @UpdateDocs('Update teacher')
  update(
    @Param('id') id: string, 
    @Body() body: any,
    @Headers('x-branch-id') branchId = 'branch1'
  ) {
    return this.service.update(id, { ...body, branchId });
  }

  @Patch(':id')
  @UpdateDocs('Partially update teacher')
  partialUpdate(
    @Param('id') id: string, 
    @Body() body: any,
    @Headers('x-branch-id') branchId = 'branch1'
  ) {
    return this.service.update(id, { ...body, branchId });
  }

  @Delete(':id')
  @DeleteDocs('Delete teacher')
  remove(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = 'branch1'
  ) {
    return this.service.delete(id);
  }
}