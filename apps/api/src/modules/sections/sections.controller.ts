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
  @ApiQuery({ name: 'classId', required: false })
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('classId') classId?: string,
    @Query('filter') filterStr?: string,
    @Query('ids') ids?: string,
    @Headers('x-branch-id') branchId: string = 'branch1',
  ) {
    const filter = filterStr ? JSON.parse(filterStr) : undefined;
    
    if (ids) {
      const idList = ids.split(',');
      return this.service.list({ branchId }).then(response => ({
        data: response.data.filter(item => idList.includes(item.id))
      }));
    }
    
    return this.service.list({ page, pageSize, sort, classId, filter, branchId });
  }

  @Get(':id')
  @ApiQuery({ name: 'id', required: true })
  findOne(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId: string = 'branch1',
  ) {
    return this.service.findOne(id, branchId);
  }

  @Post()
  @CreateDocs('Create section')
  create(
    @Body() body: UpsertSectionDto,
    @Headers('x-branch-id') branchId: string = 'branch1',
  ) {
    return this.service.create({ ...body, branchId });
  }

  @Patch(':id')
  @UpdateDocs('Update section')
  update(
    @Param('id') id: string,
    @Body() body: Partial<UpsertSectionDto>,
    @Headers('x-branch-id') branchId: string = 'branch1',
  ) {
    return this.service.update(id, body, branchId);
  }

  @Delete(':id')
  @DeleteDocs('Delete section')
  remove(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId: string = 'branch1',
  ) {
    return this.service.remove(id, branchId);
  }
}
