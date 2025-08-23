import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeeStructuresService } from './fee-structures.service';
import { CreateDocs, DeleteDocs, ListDocs, UpdateDocs } from '../../common/swagger.decorators';
import { IsNumber, IsOptional, IsString, IsUUID, IsPositive } from 'class-validator';

class CreateStructureDto {
  @ApiPropertyOptional({
    description: 'Unique identifier of the grade/class this fee structure applies to',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  gradeId?: string;
}

class CreateComponentDto {
  @ApiProperty({
    description: 'Unique identifier of the fee structure this component belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @IsString()
  @IsUUID()
  feeStructureId!: string;

  @ApiProperty({
    description: 'Name of the fee component',
    example: 'Tuition Fee',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    description: 'Type or category of the fee component',
    example: 'academic',
    enum: ['academic', 'transport', 'hostel', 'library', 'laboratory', 'sports', 'extracurricular', 'miscellaneous']
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    description: 'Amount for this fee component in the smallest currency unit (e.g., cents)',
    example: 50000,
    minimum: 0
  })
  @IsNumber()
  @IsPositive()
  amount!: number;
}

@ApiTags('Fee Structures')
@Controller('fees/structures')
export class FeeStructuresController {
  constructor(private readonly service: FeeStructuresService) {}

  @Get()
  @ListDocs('List fee structures')
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Headers('x-branch-id') branchId = 'branch1',
  ) {
    return this.service.list({ page, pageSize, sort, branchId });
  }

  @Post()
  @CreateDocs('Create fee structure')
  createStructure(@Body() body: CreateStructureDto, @Headers('x-branch-id') branchId = 'branch1') {
    return this.service.createStructure(body, branchId);
  }

  @Patch(':id')
  @UpdateDocs('Update fee structure')
  updateStructure(@Param('id') id: string, @Body() body: CreateStructureDto, @Headers('x-branch-id') branchId = 'branch1') {
    return this.service.updateStructure(id, body, branchId);
  }

  @Delete(':id')
  @DeleteDocs('Delete fee structure')
  removeStructure(@Param('id') id: string, @Headers('x-branch-id') branchId = 'branch1') {
    return this.service.removeStructure(id, branchId);
  }

  @Post('components')
  @CreateDocs('Create fee component')
  createComponent(@Body() body: CreateComponentDto, @Headers('x-branch-id') branchId = 'branch1') {
    return this.service.createComponent(body, branchId);
  }

  @Patch('components/:id')
  @UpdateDocs('Update fee component')
  updateComponent(@Param('id') id: string, @Body() body: Partial<CreateComponentDto>, @Headers('x-branch-id') branchId = 'branch1') {
    return this.service.updateComponent(id, body, branchId);
  }

  @Delete('components/:id')
  @DeleteDocs('Delete fee component')
  removeComponent(@Param('id') id: string, @Headers('x-branch-id') branchId = 'branch1') {
    return this.service.removeComponent(id, branchId);
  }
}
