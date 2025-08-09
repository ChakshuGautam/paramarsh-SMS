import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { ExamsService } from './exams.service';
import { CreateDocs, DeleteDocs, ListDocs, UpdateDocs } from '../../common/swagger.decorators';
import { IsOptional, IsString } from 'class-validator';

class UpsertExamDto {
  @IsString()
  name!: string;
  @IsOptional()
  @IsString()
  startDate?: string;
  @IsOptional()
  @IsString()
  endDate?: string;
}

@ApiTags('Exams')
@Controller('exams')
export class ExamsController {
  constructor(private readonly service: ExamsService) {}

  @Get()
  @ListDocs('List exams')
  @ApiQuery({ name: 'q', required: false })
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('q') q?: string,
  ) {
    return this.service.list({ page, pageSize, sort, q });
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
