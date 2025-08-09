import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { IsNumber, IsOptional, IsString } from 'class-validator';

class UpsertApplicationDto {
  @IsOptional()
  @IsString()
  tenantId?: string;
  @IsOptional()
  @IsString()
  programId?: string;
  @IsOptional()
  @IsString()
  studentProfileRef?: string;
  @IsOptional()
  @IsString()
  status?: string;
  @IsOptional()
  @IsNumber()
  score?: number;
  @IsOptional()
  @IsString()
  priorityTag?: string;
  @IsOptional()
  @IsString()
  createdAt?: string;
}

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
