import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { CreateDocs, DeleteDocs, ListDocs, UpdateDocs } from '../../common/swagger.decorators';
import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

class UpsertClassDto {
  @ApiProperty({
    description: 'Name of the class',
    example: 'Class 10A',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    description: 'Grade level of the class (1-12)',
    example: 10,
    minimum: 1,
    maximum: 12
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  gradeLevel?: number;
}

@ApiTags('Classes')
@Controller('classes')
export class ClassesController {
  constructor(private readonly service: ClassesService) {}

  @Get()
  @ListDocs('List classes')
  @ApiQuery({ name: 'q', required: false })
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('q') q?: string,
  ) {
    return this.service.list({ page, pageSize, sort, q });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @CreateDocs('Create class')
  create(@Body() body: UpsertClassDto) {
    return this.service.create(body);
  }

  @Patch(':id')
  @UpdateDocs('Update class')
  update(@Param('id') id: string, @Body() body: Partial<UpsertClassDto>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @DeleteDocs('Delete class')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
