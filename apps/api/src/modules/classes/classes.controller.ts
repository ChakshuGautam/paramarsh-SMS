import { DEFAULT_BRANCH_ID } from '../../common/constants';
import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
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
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (starts from 1)' })
  @ApiQuery({ name: 'perPage', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of items per page (alias for perPage)' })
  @ApiQuery({ name: 'sort', required: false, type: String, description: 'Sort field and direction' })
  @ApiQuery({ name: 'q', required: false })
  list(
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('q') q?: string,
    @Query('filter') filterStr?: string,
    @Query('ids') ids?: string,
    @Headers('x-branch-id') branchId: string = DEFAULT_BRANCH_ID,
  ) {
    const filter = filterStr ? JSON.parse(filterStr) : undefined;
    const effectivePerPage = perPage || pageSize;
    
    if (ids) {
      const idList = ids.split(',');
      return this.service.list({ branchId }).then(response => ({
        data: response.data.filter(item => idList.includes(item.id))
      }));
    }
    
    return this.service.list({ page, perPage: effectivePerPage, sort, q, filter, branchId });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId: string = DEFAULT_BRANCH_ID,
  ) {
    return this.service.findOne(id, branchId);
  }

  @Post()
  @CreateDocs('Create class')
  create(
    @Body() body: UpsertClassDto,
    @Headers('x-branch-id') branchId: string = DEFAULT_BRANCH_ID,
  ) {
    return this.service.create({ ...body, branchId });
  }

  @Patch(':id')
  @UpdateDocs('Update class')
  update(
    @Param('id') id: string,
    @Body() body: Partial<UpsertClassDto>,
    @Headers('x-branch-id') branchId: string = DEFAULT_BRANCH_ID,
  ) {
    return this.service.updateWithBranch(id, body, branchId);
  }

  @Delete(':id')
  @DeleteDocs('Delete class')
  remove(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId: string = DEFAULT_BRANCH_ID,
  ) {
    return this.service.remove(id, branchId);
  }

  // Teacher assignment endpoints
  @Get(':id/teachers')
  @ApiQuery({ name: 'subjectId', required: false, type: String, description: 'Filter by subject' })
  getClassTeachers(
    @Param('id') classId: string,
    @Query('subjectId') subjectId?: string,
    @Headers('x-branch-id') branchId: string = DEFAULT_BRANCH_ID,
  ) {
    return this.service.getClassTeachers(classId, branchId, subjectId);
  }

  @Post(':id/teachers')
  assignTeacher(
    @Param('id') classId: string,
    @Body() body: { teacherId: string; subjectId: string },
    @Headers('x-branch-id') branchId: string = DEFAULT_BRANCH_ID,
  ) {
    return this.service.assignTeacher(classId, body.teacherId, body.subjectId, branchId);
  }

  @Delete(':id/teachers/:teacherId')
  @ApiQuery({ name: 'subjectId', required: false, type: String, description: 'Subject to remove teacher from' })
  removeTeacher(
    @Param('id') classId: string,
    @Param('teacherId') teacherId: string,
    @Query('subjectId') subjectId?: string,
    @Headers('x-branch-id') branchId: string = DEFAULT_BRANCH_ID,
  ) {
    return this.service.removeTeacher(classId, teacherId, branchId, subjectId);
  }
}
