import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { IsNumber, IsOptional, IsString, IsUUID, IsDateString, Min, Max } from 'class-validator';

class UpsertApplicationDto {
  @ApiPropertyOptional({
    description: 'Unique identifier of the tenant/institution',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  tenantId?: string;

  @ApiPropertyOptional({
    description: 'Unique identifier of the academic program being applied to',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid'
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  programId?: string;

  @ApiPropertyOptional({
    description: 'Reference to the student profile or application form',
    example: 'APP-2024-001234',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  studentProfileRef?: string;

  @ApiPropertyOptional({
    description: 'Current status of the application',
    example: 'submitted',
    enum: ['draft', 'submitted', 'under_review', 'interview_scheduled', 'accepted', 'rejected', 'waitlisted', 'withdrawn']
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Application score or rating (0.0 to 100.0)',
    example: 85.5,
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @ApiPropertyOptional({
    description: 'Priority tag for application processing',
    example: 'scholarship',
    enum: ['regular', 'scholarship', 'sibling', 'staff_child', 'alumni_child', 'special_needs', 'international']
  })
  @IsOptional()
  @IsString()
  priorityTag?: string;

  @ApiPropertyOptional({
    description: 'Creation timestamp in ISO date format (usually auto-generated)',
    example: '2024-08-12T10:30:00Z',
    format: 'date-time'
  })
  @IsOptional()
  @IsString()
  @IsDateString()
  createdAt?: string;
}

@ApiTags('Applications')
@Controller('admissions/applications')
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Get()
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('status') status?: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.service.list({ page, pageSize, sort, status, tenantId });
  }

  @Post()
  create(@Body() body: UpsertApplicationDto) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<UpsertApplicationDto>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
