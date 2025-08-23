import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Headers } from '@nestjs/common';
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

@ApiTags('HR - Staff')
@Controller('hr/staff')
export class StaffController {
  constructor(private readonly service: StaffService) {}

  @Get()
  @ListDocs('List staff')
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'filter', required: false })
  @ApiQuery({ name: 'ids', required: false })
  list(
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('sort') sort?: string,
    @Query('filter') filter?: string,
    @Query('ids') ids?: string,
    @Query('department') department?: string,
    @Query('status') status?: string,
    @Headers('x-branch-id') branchId = 'branch1',
  ) {
    return this.service.list({ page, perPage, sort, filter, ids, department, status, branchId });
  }

  @Post()
  @CreateDocs('Create staff')
  create(
    @Body() body: UpsertStaffDto,
    @Headers('x-branch-id') branchId = 'branch1'
  ) {
    return this.service.create(body, branchId);
  }

  @Get(':id')
  @ApiTags('Staff')
  getOne(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = 'branch1'
  ) {
    return this.service.getOne(id, branchId);
  }

  @Put(':id')
  @UpdateDocs('Update staff')
  update(
    @Param('id') id: string, 
    @Body() body: Partial<UpsertStaffDto>,
    @Headers('x-branch-id') branchId = 'branch1'
  ) {
    return this.service.update(id, body, branchId);
  }

  @Patch(':id')
  @UpdateDocs('Partially update staff')
  partialUpdate(
    @Param('id') id: string, 
    @Body() body: Partial<UpsertStaffDto>,
    @Headers('x-branch-id') branchId = 'branch1'
  ) {
    return this.service.update(id, body, branchId);
  }

  @Delete(':id')
  @DeleteDocs('Delete staff')
  remove(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = 'branch1'
  ) {
    return this.service.remove(id, branchId);
  }
}
