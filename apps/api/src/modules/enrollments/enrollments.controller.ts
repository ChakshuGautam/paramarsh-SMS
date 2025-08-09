import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateDocs, DeleteDocs, ListDocs, UpdateDocs } from '../../common/swagger.decorators';
import { IsOptional, IsString } from 'class-validator';

class UpsertEnrollmentDto {
  @IsString()
  studentId!: string;
  @IsString()
  sectionId!: string;
  @IsOptional()
  @IsString()
  status?: string;
  @IsOptional()
  @IsString()
  startDate?: string;
  @IsOptional()
  @IsString()
  endDate?: string;
}

@ApiTags('Enrollments')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly service: EnrollmentsService) {}

  @Get()
  @ListDocs('List enrollments')
  @ApiQuery({ name: 'sectionId', required: false })
  @ApiQuery({ name: 'status', required: false })
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('sectionId') sectionId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.list({ page, pageSize, sort, sectionId, status });
  }

  @Post()
  @CreateDocs('Create enrollment')
  create(@Body() body: UpsertEnrollmentDto) {
    return this.service.create(body);
  }

  @Patch(':id')
  @UpdateDocs('Update enrollment')
  update(@Param('id') id: string, @Body() body: Partial<UpsertEnrollmentDto>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @DeleteDocs('Delete enrollment')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
