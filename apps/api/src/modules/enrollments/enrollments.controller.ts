import { DEFAULT_BRANCH_ID } from '../../common/constants';
import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateDocs, DeleteDocs, ListDocs, UpdateDocs } from '../../common/swagger.decorators';
import { IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';

class UpsertEnrollmentDto {
  @ApiProperty({
    description: 'Unique identifier of the student being enrolled',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @IsString()
  @IsUUID()
  studentId!: string;

  @ApiProperty({
    description: 'Unique identifier of the section the student is enrolling in',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid'
  })
  @IsString()
  @IsUUID()
  sectionId!: string;

  @ApiPropertyOptional({
    description: 'Status of the enrollment',
    example: 'active',
    enum: ['active', 'inactive', 'transferred', 'graduated', 'dropped']
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Start date of the enrollment in ISO date format',
    example: '2024-08-01',
    format: 'date'
  })
  @IsOptional()
  @IsString()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date of the enrollment in ISO date format',
    example: '2025-05-31',
    format: 'date'
  })
  @IsOptional()
  @IsString()
  @IsDateString()
  endDate?: string;
}

@ApiTags('Enrollments')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly service: EnrollmentsService) {}

  @Get()
  @ListDocs('List enrollments')
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'perPage', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Number of items per page (alias for perPage)', example: 10 })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field and direction', example: 'startDate:desc' })
  @ApiQuery({ name: 'filter', required: false, description: 'JSON filter object' })
  @ApiQuery({ name: 'ids', required: false, description: 'Comma-separated list of IDs' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ApiQuery({ name: 'sectionId', required: false, description: 'Filter by section ID' })
  @ApiQuery({ name: 'studentId', required: false, description: 'Filter by student ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by enrollment status', enum: ['active', 'inactive', 'transferred', 'graduated', 'dropped'] })
  @ApiQuery({ name: 'startDate_gte', required: false, description: 'Filter enrollments starting on or after this date', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate_lte', required: false, description: 'Filter enrollments ending on or before this date', example: '2024-12-31' })
  list(
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('filter') filter?: string,
    @Query('ids') ids?: string,
    @Query('q') q?: string,
    @Query('sectionId') sectionId?: string,
    @Query('studentId') studentId?: string,
    @Query('status') status?: string,
    @Query('startDate_gte') startDateGte?: string,
    @Query('endDate_lte') endDateLte?: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    const parsedFilter = filter ? JSON.parse(filter) : {};
    const idsArray = ids ? ids.split(',') : undefined;
    
    if (idsArray) {
      return this.service.getMany(idsArray, branchId);
    }
    
    const effectivePerPage = perPage || pageSize;
    return this.service.list({ 
      page, 
      perPage: effectivePerPage, 
      sort, 
      filter: parsedFilter,
      q,
      sectionId, 
      studentId,
      status,
      startDateGte,
      endDateLte,
      branchId,
    });
  }

  @Get(':id')
  getOne(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
  ) {
    return this.service.getOne(id, branchId);
  }

  @Post()
  @CreateDocs('Create enrollment')
  create(
    @Body() body: UpsertEnrollmentDto,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
  ) {
    return this.service.create({ ...body, branchId });
  }

  @Put(':id')
  @UpdateDocs('Update enrollment')
  update(
    @Param('id') id: string, 
    @Body() body: Partial<UpsertEnrollmentDto>,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
  ) {
    return this.service.update(id, { ...body, branchId });
  }

  @Patch(':id')
  @UpdateDocs('Partially update enrollment')
  partialUpdate(
    @Param('id') id: string, 
    @Body() body: Partial<UpsertEnrollmentDto>,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
  ) {
    return this.service.update(id, { ...body, branchId });
  }

  @Delete(':id')
  @DeleteDocs('Delete enrollment')
  remove(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID
  ) {
    return this.service.remove(id, branchId);
  }
}
