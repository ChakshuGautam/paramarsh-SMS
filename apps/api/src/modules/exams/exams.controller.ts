import { DEFAULT_BRANCH_ID } from '../../common/constants';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExamsService } from './exams.service';
import { CreateDocs, DeleteDocs, ListDocs, UpdateDocs } from '../../common/swagger.decorators';
import { IsOptional, IsString, IsDateString } from 'class-validator';

class UpsertExamDto {
  @ApiProperty({
    description: 'Name of the examination',
    example: 'Final Examinations 2024',
    minLength: 1,
    maxLength: 200
  })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    description: 'Start date of the examination period in ISO date format',
    example: '2024-12-01',
    format: 'date'
  })
  @IsOptional()
  @IsString()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date of the examination period in ISO date format',
    example: '2024-12-15',
    format: 'date'
  })
  @IsOptional()
  @IsString()
  @IsDateString()
  endDate?: string;
}

@ApiTags('Exams')
@Controller('exams')
export class ExamsController {
  constructor(private readonly service: ExamsService) {}

  @Get()
  @ListDocs('List exams')
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'perPage', required: false, description: 'Number of items per page (alias for pageSize)', example: 10 })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field and direction', example: 'startDate:desc' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query for exam name', example: 'final' })
  @ApiQuery({ name: 'startDate_gte', required: false, description: 'Filter exams starting on or after this date', example: '2024-01-01' })
  @ApiQuery({ name: 'startDate_lte', required: false, description: 'Filter exams starting on or before this date', example: '2024-12-31' })
  @ApiQuery({ name: 'startDate_gt', required: false, description: 'Filter exams starting after this date', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate_gte', required: false, description: 'Filter exams ending on or after this date', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate_lte', required: false, description: 'Filter exams ending on or before this date', example: '2024-12-31' })
  @ApiQuery({ name: 'academicYearId', required: false, description: 'Filter exams by academic year', example: 'df13dac5-04a1-423e-9008-1a7d79ebcc58' })
  @ApiQuery({ name: 'examType', required: false, description: 'Filter exams by type', example: 'UNIT_TEST' })
  @ApiQuery({ name: 'term', required: false, description: 'Filter exams by term', example: 1 })
  @ApiQuery({ name: 'status', required: false, description: 'Filter exams by status', example: 'SCHEDULED' })
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('perPage') perPage?: number,
    @Query('sort') sort?: string,
    @Query('q') q?: string,
    @Query('startDate_gte') startDateGte?: string,
    @Query('startDate_lte') startDateLte?: string,
    @Query('startDate_gt') startDateGt?: string,
    @Query('endDate_gte') endDateGte?: string,
    @Query('endDate_lte') endDateLte?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('examType') examType?: string,
    @Query('term') term?: number | string,
    @Query('status') status?: string,
  ) {
    const effectivePageSize = perPage || pageSize;
    return this.service.list({ 
      page, 
      perPage: effectivePageSize, 
      sort, 
      q, 
      startDateGte,
      startDateLte,
      startDateGt,
      endDateGte,
      endDateLte,
      academicYearId,
      examType,
      term,
      status,
    });
  }

  @Get(':id')
  @ListDocs('Get exam by ID')
  getOne(@Param('id') id: string) {
    return this.service.getOne(id);
  }

  @Post()
  @CreateDocs('Create exam')
  create(@Body() body: UpsertExamDto) {
    return this.service.create(body);
  }

  @Patch(':id')
  @UpdateDocs('Update exam')
  update(@Param('id') id: string, @Body() body: Partial<UpsertExamDto>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @DeleteDocs('Delete exam')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
