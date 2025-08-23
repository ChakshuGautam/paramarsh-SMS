import { Controller, Get, Post, Put, Patch, Delete, Param, Query, Body, Headers } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from '../../common/base-crud.controller';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@ApiTags('Applications')
@Controller('admissions/applications')
export class ApplicationsController extends BaseCrudController<any> {
  constructor(private readonly applicationsService: ApplicationsService) {
    super(applicationsService);
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
      return this.applicationsService.getMany(idArray, branchId);
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
    
    // Merge restQuery as additional filters
    filter = { ...filter, ...restQuery };
    
    const result = await this.applicationsService.findAll({
      page: +(page || 1),
      pageSize: +(pageSize || perPage || 25),
      sort,
      filter,
      branchId
    });

    return {
      data: result.data,
      total: result.total
    };
  }

  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = 'branch1',
  ) {
    const result = await this.applicationsService.findOne(id, branchId);
    return { data: result };
  }

  @Post()
  async create(
    @Body() createDto: CreateApplicationDto,
    @Headers('x-branch-id') branchId = 'branch1',
  ) {
    const result = await this.applicationsService.create({ 
      ...createDto, 
      branchId 
    });
    return { data: result };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateApplicationDto,
    @Headers('x-branch-id') branchId = 'branch1',
  ) {
    const result = await this.applicationsService.update(id, updateDto, branchId);
    return { data: result };
  }

  @Patch(':id')
  async patch(
    @Param('id') id: string,
    @Body() updateDto: Partial<UpdateApplicationDto>,
    @Headers('x-branch-id') branchId = 'branch1',
  ) {
    const result = await this.applicationsService.update(id, updateDto, branchId);
    return { data: result };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = 'branch1',
  ) {
    const result = await this.applicationsService.remove(id, branchId);
    return { data: result };
  }
}