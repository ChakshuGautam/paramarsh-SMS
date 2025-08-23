import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  Query,
  Headers,
  NotFoundException,
  ConflictException,
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
  async create(
    @Headers('x-branch-id') branchId = 'branch1',
    @Body() createSubjectDto: CreateSubjectDto,
  ) {
    try {
      const data = await this.subjectsService.create(createSubjectDto);
      return { data };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Subject code already exists');
      }
      throw error;
    }
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all subjects',
    description: 'Retrieves a list of all subjects with optional filtering and pagination'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'perPage', required: false, description: 'Number of items per page', example: 25 })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field and direction', example: 'name' })
  @ApiQuery({ name: 'filter', required: false, description: 'Filter JSON string' })
  @ApiQuery({ name: 'ids', required: false, description: 'Comma-separated IDs for getMany' })
  @ListDocs('List of all subjects')
  findAll(
    @Headers('x-branch-id') branchId = 'branch1',
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('sort') sort?: string,
    @Query('filter') filterStr?: string,
    @Query('ids') idsStr?: string,
  ) {
    // Parse filter
    let filter = {};
    if (filterStr) {
      try {
        filter = JSON.parse(filterStr);
      } catch {
        filter = {};
      }
    }

    // Handle getMany (ids provided)
    if (idsStr) {
      const ids = idsStr.split(',');
      return this.subjectsService.findMany(ids);
    }

    return this.subjectsService.findAll({
      page: page ? parseInt(page) : 1,
      perPage: perPage ? parseInt(perPage) : 25,
      sort,
      ...filter,
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
  async findOne(
    @Headers('x-branch-id') branchId = 'branch1',
    @Param('id') id: string,
  ) {
    const data = await this.subjectsService.findOne(id);
    if (!data) {
      throw new NotFoundException('Subject not found');
    }
    return { data };
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

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update subject (full replacement)',
    description: 'Updates an existing subject with new information'
  })
  @ApiParam({ name: 'id', description: 'Subject ID', example: 'subject-123' })
  @UpdateDocs('Subject updated successfully')
  async update(
    @Headers('x-branch-id') branchId = 'branch1',
    @Param('id') id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ) {
    try {
      const data = await this.subjectsService.update(id, updateSubjectDto);
      return { data };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Subject not found');
      }
      throw error;
    }
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update subject (partial)',
    description: 'Partially updates an existing subject'
  })
  @ApiParam({ name: 'id', description: 'Subject ID', example: 'subject-123' })
  @UpdateDocs('Subject updated successfully')
  async patch(
    @Headers('x-branch-id') branchId = 'branch1',
    @Param('id') id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ) {
    try {
      const data = await this.subjectsService.update(id, updateSubjectDto);
      return { data };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Subject not found');
      }
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete subject',
    description: 'Removes a subject from the system (if not referenced in timetables)'
  })
  @ApiParam({ name: 'id', description: 'Subject ID', example: 'subject-123' })
  @DeleteDocs('Subject deleted successfully')
  async remove(
    @Headers('x-branch-id') branchId = 'branch1',
    @Param('id') id: string,
  ) {
    try {
      const data = await this.subjectsService.remove(id);
      return { data };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Subject not found');
      }
      throw error;
    }
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