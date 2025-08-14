import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MarksService } from './marks.service';
import { CreateDocs, DeleteDocs, ListDocs, UpdateDocs } from '../../common/swagger.decorators';
import { IsNumber, IsOptional, IsString, IsUUID, Min, Max } from 'class-validator';

class UpsertMarkDto {
  @ApiProperty({
    description: 'Unique identifier of the student whose marks are being recorded',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @IsString()
  @IsUUID()
  studentId!: string;

  @ApiProperty({
    description: 'Unique identifier of the exam session for which marks are being recorded',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid'
  })
  @IsString()
  @IsUUID()
  sessionId!: string;

  @ApiPropertyOptional({
    description: 'Raw numerical marks obtained by the student (0-100)',
    example: 85.5,
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  rawMarks?: number;

  @ApiPropertyOptional({
    description: 'Letter grade assigned based on the marks',
    example: 'A',
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'I', 'W']
  })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiPropertyOptional({
    description: 'Additional comments or feedback about the student\'s performance',
    example: 'Excellent work with good understanding of concepts',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  comments?: string;
}

@ApiTags('Marks')
@Controller('marks')
export class MarksController {
  constructor(private readonly service: MarksService) {}

  @Get()
  @ListDocs('List marks')
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
  @CreateDocs('Create marks entry')
  create(@Body() body: UpsertMarkDto) {
    return this.service.create(body);
  }

  @Patch(':id')
  @UpdateDocs('Update marks entry')
  update(@Param('id') id: string, @Body() body: Partial<UpsertMarkDto>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @DeleteDocs('Delete marks entry')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
