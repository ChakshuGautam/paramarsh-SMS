import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { FeeStructuresService } from './fee-structures.service';
import { IsNumber, IsOptional, IsString } from 'class-validator';

class CreateStructureDto {
  @IsOptional()
  @IsString()
  gradeId?: string;
}

class CreateComponentDto {
  @IsString()
  feeStructureId!: string;
  @IsString()
  name!: string;
  @IsOptional()
  @IsString()
  type?: string;
  @IsNumber()
  amount!: number;
}

@ApiTags('Fee Structures')
@Controller('fees/structures')
export class FeeStructuresController {
  constructor(private readonly service: FeeStructuresService) {}

  @Get()
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
  ) {
    return this.service.list({ page, pageSize, sort });
  }

  @Post()
  createStructure(@Body() body: CreateStructureDto) {
    return this.service.createStructure(body);
  }

  @Patch(':id')
  updateStructure(@Param('id') id: string, @Body() body: CreateStructureDto) {
    return this.service.updateStructure(id, body);
  }

  @Delete(':id')
  removeStructure(@Param('id') id: string) {
    return this.service.removeStructure(id);
  }

  @Post('components')
  createComponent(@Body() body: CreateComponentDto) {
    return this.service.createComponent(body);
  }

  @Patch('components/:id')
  updateComponent(@Param('id') id: string, @Body() body: Partial<CreateComponentDto>) {
    return this.service.updateComponent(id, body);
  }

  @Delete('components/:id')
  removeComponent(@Param('id') id: string) {
    return this.service.removeComponent(id);
  }
}
