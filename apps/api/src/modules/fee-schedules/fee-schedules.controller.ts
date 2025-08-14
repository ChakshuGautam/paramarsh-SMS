import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeeSchedulesService } from './fee-schedules.service';
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
  list(@Query('page') page?: number, @Query('pageSize') pageSize?: number, @Query('sort') sort?: string) {
    return this.service.list({ page, pageSize, sort });
  }

  @Post()
  create(@Body() body: CreateFeeScheduleDto) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<CreateFeeScheduleDto>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/generate')
  generate(@Param('id') id: string) {
    return this.service.generateForSchedule(id);
  }
}
