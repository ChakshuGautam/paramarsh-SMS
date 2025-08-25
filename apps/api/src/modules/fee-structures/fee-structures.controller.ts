import { DEFAULT_BRANCH_ID } from '../../common/constants';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeeStructuresService } from './fee-structures.service';
import { CreateDocs, DeleteDocs, GetDocs, ListDocs, UpdateDocs } from '../../common/swagger.decorators';
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
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (starts from 1)' })
  @ApiQuery({ name: 'perPage', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of items per page (alias for perPage)' })
  @ApiQuery({ name: 'sort', required: false, type: String, description: 'Sort field and direction' })
  @ApiQuery({ name: 'ids', required: false, type: String, description: 'Comma-separated list of IDs for getMany' })
  list(
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('ids') ids?: string,
    @Query('filter') filterStr?: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    const filter = filterStr ? JSON.parse(filterStr) : undefined;
    
    if (ids) {
      const idList = ids.split(',');
      return this.service.list({ branchId }).then(response => ({
        data: response.data.filter(item => idList.includes(item.id))
      }));
    }
    
    const effectivePageSize = perPage || pageSize;
    return this.service.list({ page, pageSize: effectivePageSize, sort, filter, branchId });
  }

  @Get(':id')
  @GetDocs('Get fee structure by ID')
  getOne(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.service.getOne(id, branchId);
  }

  @Post()
  @CreateDocs('Create fee structure')
  createStructure(@Body() body: CreateStructureDto, @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID) {
    return this.service.createStructure(body, branchId);
  }

  @Patch(':id')
  @UpdateDocs('Update fee structure')
  updateStructure(@Param('id') id: string, @Body() body: CreateStructureDto, @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID) {
    return this.service.updateStructure(id, body, branchId);
  }

  @Delete(':id')
  @DeleteDocs('Delete fee structure')
  removeStructure(@Param('id') id: string, @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID) {
    return this.service.removeStructure(id, branchId);
  }

  @Post('components')
  @CreateDocs('Create fee component')
  createComponent(@Body() body: CreateComponentDto, @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID) {
    return this.service.createComponent(body, branchId);
  }

  @Patch('components/:id')
  @UpdateDocs('Update fee component')
  updateComponent(@Param('id') id: string, @Body() body: Partial<CreateComponentDto>, @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID) {
    return this.service.updateComponent(id, body, branchId);
  }

  @Delete('components/:id')
  @DeleteDocs('Delete fee component')
  removeComponent(@Param('id') id: string, @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID) {
    return this.service.removeComponent(id, branchId);
  }
}
