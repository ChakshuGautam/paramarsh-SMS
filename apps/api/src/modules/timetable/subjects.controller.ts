import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { ListDocs, CreateDocs, UpdateDocs, DeleteDocs } from '../../common/swagger.decorators';

@ApiTags('Subjects')
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new subject',
    description: 'Creates a new subject with code, name, and optional details like credits and prerequisites'
  })
  @CreateDocs('Subject created successfully')
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.create(createSubjectDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all subjects',
    description: 'Retrieves a list of all subjects with optional filtering and pagination'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field and direction', example: 'name:asc' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query for name and code', example: 'math' })
  @ApiQuery({ name: 'credits', required: false, description: 'Filter by credit hours', example: '3' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status', example: 'true' })
  @ListDocs('List of all subjects')
  findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('q') q?: string,
    @Query('credits') credits?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.subjectsService.findAll({
      page,
      pageSize,
      sort,
      q,
      credits: credits ? parseInt(credits) : undefined,
      isActive: isActive ? isActive === 'true' : undefined,
    });
  }

  @Get('by-class/:classId')
  @ApiOperation({ 
    summary: 'Get subjects by class',
    description: 'Retrieves all subjects taught in a specific class'
  })
  @ApiParam({ name: 'classId', description: 'Class ID', example: 'class-123' })
  @ListDocs('List of subjects for the specified class')
  getByClass(@Param('classId') classId: string) {
    return this.subjectsService.getSubjectsByClass(classId);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get subject by ID',
    description: 'Retrieves detailed information about a specific subject'
  })
  @ApiParam({ name: 'id', description: 'Subject ID', example: 'subject-123' })
  @ListDocs('Subject details')
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(id);
  }

  @Get(':id/load')
  @ApiOperation({ 
    summary: 'Get subject teaching load',
    description: 'Retrieves the current teaching load and schedule for a subject'
  })
  @ApiParam({ name: 'id', description: 'Subject ID', example: 'subject-123' })
  @ListDocs('Subject teaching load information')
  getSubjectLoad(@Param('id') id: string) {
    return this.subjectsService.getSubjectLoad(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update subject',
    description: 'Updates an existing subject with new information'
  })
  @ApiParam({ name: 'id', description: 'Subject ID', example: 'subject-123' })
  @UpdateDocs('Subject updated successfully')
  update(
    @Param('id') id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ) {
    return this.subjectsService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete subject',
    description: 'Removes a subject from the system (if not referenced in timetables)'
  })
  @ApiParam({ name: 'id', description: 'Subject ID', example: 'subject-123' })
  @DeleteDocs('Subject deleted successfully')
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(id);
  }

  @Post(':id/constraints')
  @ApiOperation({ 
    summary: 'Add scheduling constraint',
    description: 'Adds a scheduling constraint to a subject (e.g., preferred time slots, room requirements)'
  })
  @ApiParam({ name: 'id', description: 'Subject ID', example: 'subject-123' })
  @CreateDocs('Constraint added successfully')
  addConstraint(
    @Param('id') id: string,
    @Body() constraint: {
      type: string;
      value: string;
      priority?: number;
    },
  ) {
    return this.subjectsService.addConstraint(id, constraint);
  }
}