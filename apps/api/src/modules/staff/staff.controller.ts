import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { CreateDocs, DeleteDocs, ListDocs, UpdateDocs } from '../../common/swagger.decorators';
import { IsOptional, IsString, IsEmail, IsDateString } from 'class-validator';

class UpsertStaffDto {
  @ApiProperty({
    description: 'First name of the staff member',
    example: 'John',
    minLength: 1,
    maxLength: 50
  })
  @IsString()
  firstName!: string;

  @ApiProperty({
    description: 'Last name of the staff member',
    example: 'Smith',
    minLength: 1,
    maxLength: 50
  })
  @IsString()
  lastName!: string;

  @ApiPropertyOptional({
    description: 'Email address of the staff member',
    example: 'john.smith@school.edu',
    format: 'email'
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the staff member',
    example: '+1-234-567-8900',
    maxLength: 20
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Job designation or title of the staff member',
    example: 'Mathematics Teacher',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiPropertyOptional({
    description: 'Department the staff member belongs to',
    example: 'Mathematics',
    enum: ['Administration', 'Mathematics', 'Science', 'English', 'History', 'Physical Education', 'Arts', 'Music', 'IT', 'Library', 'Counseling']
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    description: 'Type of employment',
    example: 'full_time',
    enum: ['full_time', 'part_time', 'contract', 'substitute', 'volunteer']
  })
  @IsOptional()
  @IsString()
  employmentType?: string;

  @ApiPropertyOptional({
    description: 'Date when the staff member joined in ISO date format',
    example: '2024-08-01',
    format: 'date'
  })
  @IsOptional()
  @IsString()
  @IsDateString()
  joinDate?: string;

  @ApiPropertyOptional({
    description: 'Current employment status',
    example: 'active',
    enum: ['active', 'inactive', 'on_leave', 'terminated', 'retired']
  })
  @IsOptional()
  @IsString()
  status?: string;
}

@ApiTags('Staff')
@Controller('hr/staff')
export class StaffController {
  constructor(private readonly service: StaffService) {}

  @Get()
  @ListDocs('List staff')
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'status', required: false })
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('department') department?: string,
    @Query('status') status?: string,
  ) {
    return this.service.list({ page, pageSize, sort, department, status });
  }

  @Post()
  @CreateDocs('Create staff')
  create(@Body() body: UpsertStaffDto) {
    return this.service.create(body);
  }

  @Patch(':id')
  @UpdateDocs('Update staff')
  update(@Param('id') id: string, @Body() body: Partial<UpsertStaffDto>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @DeleteDocs('Delete staff')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
