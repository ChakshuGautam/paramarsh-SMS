<<<<<<< HEAD
import { DEFAULT_BRANCH_ID } from '../../common/constants';
=======
>>>>>>> origin/main
import { Controller, Get, Post, Put, Patch, Delete, Param, Query, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { AcademicYearsService } from './academic-years.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';
import { CreateDocs, DeleteDocs, ListDocs, UpdateDocs } from '../../common/swagger.decorators';

@ApiTags('Academic Years')
@Controller('academic-years')
export class AcademicYearsController {
  constructor(private readonly service: AcademicYearsService) {}

  @Get()
  @ListDocs('List academic years')
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
  @ApiQuery({ name: 'isActive', required: false })
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
    @Query('isActive') isActive?: string,
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
    return this.service.list({ page, perPage: effectivePerPage, sort, filter: parsedFilter, q, isActive, branchId });
=======
    return this.service.list({ page, pageSize, sort, filter: parsedFilter, q, isActive, branchId });
>>>>>>> origin/main
  }

  @Post()
  @CreateDocs('Create academic year')
  create(
    @Body() body: CreateAcademicYearDto,
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
  @UpdateDocs('Update academic year')
  update(
    @Param('id') id: string, 
    @Body() body: UpdateAcademicYearDto,
<<<<<<< HEAD
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
=======
    @Headers('x-branch-id') branchId = 'branch1'
>>>>>>> origin/main
  ) {
    return this.service.update(id, { ...body, branchId });
  }

  @Patch(':id')
  @UpdateDocs('Partially update academic year')
  partialUpdate(
    @Param('id') id: string, 
    @Body() body: Partial<UpdateAcademicYearDto>,
<<<<<<< HEAD
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
=======
    @Headers('x-branch-id') branchId = 'branch1'
>>>>>>> origin/main
  ) {
    return this.service.update(id, { ...body, branchId });
  }

  @Delete(':id')
  @DeleteDocs('Delete academic year')
  remove(
    @Param('id') id: string,
<<<<<<< HEAD
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
=======
    @Headers('x-branch-id') branchId = 'branch1'
>>>>>>> origin/main
  ) {
    return this.service.remove(id, branchId);
  }
}