import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { CreateDocs, DeleteDocs, ListDocs, UpdateDocs } from '../../common/swagger.decorators';
import { IsOptional, IsString } from 'class-validator';

class UpsertStaffDto {
  @IsString()
  firstName!: string;
  @IsString()
  lastName!: string;
  @IsOptional()
  @IsString()
  email?: string;
  @IsOptional()
  @IsString()
  phone?: string;
  @IsOptional()
  @IsString()
  designation?: string;
  @IsOptional()
  @IsString()
  department?: string;
  @IsOptional()
  @IsString()
  employmentType?: string;
  @IsOptional()
  @IsString()
  joinDate?: string;
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
