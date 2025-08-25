import { DEFAULT_BRANCH_ID } from '../../common/constants';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiProperty, ApiPropertyOptional, ApiQuery } from '@nestjs/swagger';
import { FeeSchedulesService } from './fee-schedules.service';
import { CreateDocs, DeleteDocs, GetDocs, ListDocs, UpdateDocs } from '../../common/swagger.decorators';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min, IsUUID, IsDateString } from 'class-validator';

class CreateFeeScheduleDto {
  @ApiProperty({
    description: 'Unique identifier of the fee structure this schedule belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @IsString()
  @IsUUID()
  feeStructureId!: string;

  @ApiProperty({
    description: 'How frequently the fees should be collected',
    example: 'monthly',
    enum: ['monthly', 'quarterly', 'halfYearly', 'annual']
  })
  @IsEnum(['monthly', 'quarterly', 'halfYearly', 'annual'] as const)
  recurrence!: 'monthly' | 'quarterly' | 'halfYearly' | 'annual';

  @ApiProperty({
    description: 'Day of the month when fees are due (1-28)',
    example: 15,
    minimum: 1,
    maximum: 28
  })
  @IsInt()
  @Min(1)
  @Max(28)
  dueDayOfMonth!: number;

  @ApiPropertyOptional({
    description: 'Start date for the fee schedule in ISO date format',
    example: '2024-08-01',
    format: 'date'
  })
  @IsOptional()
  @IsString()
  @IsDateString()
  startDate?: string | null;

  @ApiPropertyOptional({
    description: 'End date for the fee schedule in ISO date format',
    example: '2025-05-31',
    format: 'date'
  })
  @IsOptional()
  @IsString()
  @IsDateString()
  endDate?: string | null;

  @ApiPropertyOptional({
    description: 'Specific class this schedule applies to (optional, for class-specific fees)',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid'
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  classId?: string | null;

  @ApiPropertyOptional({
    description: 'Specific section this schedule applies to (optional, for section-specific fees)',
    example: '550e8400-e29b-41d4-a716-446655440002',
    format: 'uuid'
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  sectionId?: string | null;

  @ApiPropertyOptional({
    description: 'Current status of the fee schedule',
    example: 'active',
    enum: ['active', 'paused']
  })
  @IsOptional()
  @IsEnum(['active', 'paused'] as const)
  status?: 'active' | 'paused';
}

@ApiTags('Fee Schedules')
@Controller('fees/schedules')
export class FeeSchedulesController {
  constructor(private readonly service: FeeSchedulesService) {}

  @Get()
  @ListDocs('List fee schedules')
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (starts from 1)' })
  @ApiQuery({ name: 'perPage', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of items per page (alias for perPage)' })
  @ApiQuery({ name: 'sort', required: false, type: String, description: 'Sort field and direction' })
  @ApiQuery({ name: 'ids', required: false, type: String, description: 'Comma-separated list of IDs for getMany' })
  list(
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('ids') ids?: string,
    @Query('filter') filterStr?: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    const filter = filterStr ? JSON.parse(filterStr) : undefined;
    
    if (ids) {
      const idList = ids.split(',');
      return this.service.list({ branchId }).then(response => ({
        data: response.data.filter(item => idList.includes(item.id))
      }));
    }
    
    const effectivePerPage = perPage || pageSize;
    return this.service.list({ page, perPage: effectivePerPage, sort, filter, branchId });
  }

  @Get(':id')
  @GetDocs('Get fee schedule by ID')
  getOne(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.service.getOne(id, branchId);
  }

  @Post()
  @CreateDocs('Create fee schedule')
  create(
    @Body() body: CreateFeeScheduleDto,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.service.create(body, branchId);
  }

  @Patch(':id')
  @UpdateDocs('Update fee schedule')
  update(
    @Param('id') id: string,
    @Body() body: Partial<CreateFeeScheduleDto>,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.service.update(id, body, branchId);
  }

  @Delete(':id')
  @DeleteDocs('Delete fee schedule')
  remove(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.service.remove(id, branchId);
  }

  @Post(':id/generate')
  generate(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.service.generateForSchedule(id, branchId);
  }
}
