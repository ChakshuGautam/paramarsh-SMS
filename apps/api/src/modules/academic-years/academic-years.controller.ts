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
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'filter', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'ids', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('filter') filter?: string,
    @Query('q') q?: string,
    @Query('ids') ids?: string,
    @Query('isActive') isActive?: string,
    @Headers('x-branch-id') branchId = 'branch1',
  ) {
    const parsedFilter = filter ? JSON.parse(filter) : {};
    const idsArray = ids ? ids.split(',') : undefined;
    
    if (idsArray) {
      return this.service.getMany(idsArray, branchId);
    }
    
    return this.service.list({ page, pageSize, sort, filter: parsedFilter, q, isActive, branchId });
  }

  @Post()
  @CreateDocs('Create academic year')
  create(
    @Body() body: CreateAcademicYearDto,
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
  @UpdateDocs('Update academic year')
  update(
    @Param('id') id: string, 
    @Body() body: UpdateAcademicYearDto,
    @Headers('x-branch-id') branchId = 'branch1'
  ) {
    return this.service.update(id, { ...body, branchId });
  }

  @Patch(':id')
  @UpdateDocs('Partially update academic year')
  partialUpdate(
    @Param('id') id: string, 
    @Body() body: Partial<UpdateAcademicYearDto>,
    @Headers('x-branch-id') branchId = 'branch1'
  ) {
    return this.service.update(id, { ...body, branchId });
  }

  @Delete(':id')
  @DeleteDocs('Delete academic year')
  remove(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = 'branch1'
  ) {
    return this.service.remove(id, branchId);
  }
}