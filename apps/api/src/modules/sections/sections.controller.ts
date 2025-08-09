import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { SectionsService } from './sections.service';
import { CreateDocs, DeleteDocs, ListDocs, UpdateDocs } from '../../common/swagger.decorators';
import { IsNumber, IsOptional, IsString } from 'class-validator';

class UpsertSectionDto {
  @IsString()
  classId!: string;
  @IsString()
  name!: string;
  @IsOptional()
  @IsNumber()
  capacity?: number;
}

@ApiTags('Sections')
@Controller('sections')
export class SectionsController {
  constructor(private readonly service: SectionsService) {}

  @Get()
  @ListDocs('List sections')
  @ApiQuery({ name: 'classId', required: false })
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('classId') classId?: string,
  ) {
    return this.service.list({ page, pageSize, sort, classId });
  }

  @Post()
  @CreateDocs('Create section')
  create(@Body() body: UpsertSectionDto) {
    return this.service.create(body);
  }

  @Patch(':id')
  @UpdateDocs('Update section')
  update(@Param('id') id: string, @Body() body: Partial<UpsertSectionDto>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @DeleteDocs('Delete section')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
