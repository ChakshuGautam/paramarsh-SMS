import { DEFAULT_BRANCH_ID } from '../../common/constants';
import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SectionsService } from './sections.service';
import { CreateDocs, DeleteDocs, ListDocs, UpdateDocs } from '../../common/swagger.decorators';
import { IsNumber, IsOptional, IsString, IsUUID, Length, Min, Max } from 'class-validator';

class UpsertSectionDto {
  @ApiProperty({
    description: 'Class ID that this section belongs to',
    example: 'class-123',
    format: 'uuid'
  })
  @IsString()
  @IsUUID()
  classId!: string;

  @ApiProperty({
    description: 'Section name',
    example: 'A',
    minLength: 1,
    maxLength: 50
  })
  @IsString()
  @Length(1, 50)
  name!: string;

  @ApiPropertyOptional({
    description: 'Maximum capacity of students in this section',
    example: 40,
    minimum: 1,
    maximum: 200
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(200)
  capacity?: number;
}

@ApiTags('Sections')
@Controller('sections')
export class SectionsController {
  constructor(private readonly service: SectionsService) {}

  @Get()
  @ListDocs('List sections')
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'perPage', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field and direction', example: 'name:asc' })
  @ApiQuery({ name: 'classId', required: false, description: 'Filter by class ID' })
  @ApiQuery({ name: 'filter', required: false, description: 'JSON filter object' })
  @ApiQuery({ name: 'ids', required: false, description: 'Comma-separated list of IDs' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  list(
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('pageSize') pageSize?: number, // Keep for backward compatibility
    @Query('sort') sort?: string,
    @Query('classId') classId?: string,
    @Query('filter') filterStr?: string,
    @Query('ids') ids?: string,
    @Query('q') q?: string,
    @Headers('x-branch-id') branchId: string = DEFAULT_BRANCH_ID,
  ) {
    const filter = filterStr ? JSON.parse(filterStr) : undefined;
    
    if (ids) {
      const idList = ids.split(',');
      return this.service.list({ branchId }).then(response => ({
        data: response.data.filter(item => idList.includes(item.id))
      }));
    }
    
    // Use perPage if provided, fallback to pageSize for backward compatibility
    const effectivePerPage = perPage || pageSize;
    return this.service.list({ page, perPage: effectivePerPage, sort, classId, filter, q, branchId });
  }

  @Get(':id')
  @ApiQuery({ name: 'id', required: true })
  findOne(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId: string = DEFAULT_BRANCH_ID,
  ) {
    return this.service.findOne(id, branchId);
  }

  @Post()
  @CreateDocs('Create section')
  create(
    @Body() body: UpsertSectionDto,
    @Headers('x-branch-id') branchId: string = DEFAULT_BRANCH_ID,
  ) {
    return this.service.create({ ...body, branchId });
  }

  @Patch(':id')
  @UpdateDocs('Update section')
  update(
    @Param('id') id: string,
    @Body() body: Partial<UpsertSectionDto>,
    @Headers('x-branch-id') branchId: string = DEFAULT_BRANCH_ID,
  ) {
    return this.service.update(id, body, branchId);
  }

  @Delete(':id')
  @DeleteDocs('Delete section')
  remove(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId: string = DEFAULT_BRANCH_ID,
  ) {
    return this.service.remove(id, branchId);
  }
}
