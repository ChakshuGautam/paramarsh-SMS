import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { MarksService } from './marks.service';
import { IsNumber, IsOptional, IsString } from 'class-validator';

class UpsertMarkDto {
  @IsString()
  studentId!: string;
  @IsString()
  sessionId!: string;
  @IsOptional()
  @IsNumber()
  rawMarks?: number;
  @IsOptional()
  @IsString()
  grade?: string;
  @IsOptional()
  @IsString()
  comments?: string;
}

@ApiTags('Marks')
@Controller('marks')
export class MarksController {
  constructor(private readonly service: MarksService) {}

  @Get()
  @ApiQuery({ name: 'studentId', required: false })
  @ApiQuery({ name: 'sessionId', required: false })
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('studentId') studentId?: string,
    @Query('sessionId') sessionId?: string,
  ) {
    return this.service.list({ page, pageSize, sort, studentId, sessionId });
  }

  @Post()
  create(@Body() body: UpsertMarkDto) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<UpsertMarkDto>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
