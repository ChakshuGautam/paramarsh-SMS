import { DEFAULT_BRANCH_ID } from '../../common/constants';
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
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
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
  @ApiQuery({ name: 'pageSize', required: false, description: 'Number of items per page (alias for perPage)', example: 25 })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field and direction', example: 'name' })
  @ApiQuery({ name: 'filter', required: false, description: 'Filter JSON string' })
  @ApiQuery({ name: 'ids', required: false, description: 'Comma-separated IDs for getMany' })
  @ListDocs('List of all subjects')
  findAll(
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('pageSize') pageSize?: string,
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

    const effectivePerPage = perPage || pageSize;
    return this.subjectsService.findAll({
      page: page ? parseInt(page) : 1,
      perPage: effectivePerPage ? parseInt(effectivePerPage) : 25,
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

  @Get('appropriate-for-class/:classId')
  @ApiOperation({ 
    summary: 'Get grade-appropriate subjects for class',
    description: 'Retrieves subjects that are educationally appropriate for the specified class grade level'
  })
  @ApiParam({ name: 'classId', description: 'Class ID', example: 'class-123' })
  @ListDocs('List of grade-appropriate subjects for the class')
  getAppropriateForClass(
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
    @Param('classId') classId: string,
  ) {
    return this.subjectsService.getSubjectsForClass(classId);
  }

  @Get('with-grade-filter')
  @ApiOperation({ 
    summary: 'Get subjects with grade-level filtering',
    description: 'Retrieves subjects filtered by grade level appropriateness'
  })
  @ApiQuery({ name: 'gradeLevel', required: false, description: 'Grade level (0-12)', example: 0 })
  @ApiQuery({ name: 'className', required: false, description: 'Class name', example: 'Nursery' })
  @ApiQuery({ name: 'classId', required: false, description: 'Class ID', example: 'class-123' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'perPage', required: false, description: 'Items per page', example: 25 })
  @ListDocs('List of grade-appropriate subjects')
  getWithGradeFilter(
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
    @Query('gradeLevel') gradeLevel?: string,
    @Query('className') className?: string,
    @Query('classId') classId?: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sort') sort?: string,
    @Query('q') q?: string,
  ) {
    const filters: any = {};
    if (gradeLevel !== undefined) filters.gradeLevel = parseInt(gradeLevel);
    if (className) filters.className = className;
    if (classId) filters.classId = classId;
    if (page) filters.page = parseInt(page);
    if (perPage || pageSize) filters.perPage = parseInt(perPage || pageSize || '25');
    if (sort) filters.sort = sort;
    if (q) filters.q = q;

    return this.subjectsService.findAllWithGradeFilter(filters);
  }

  @Get('validate-assignment/:subjectId/:classId')
  @ApiOperation({ 
    summary: 'Validate subject-class assignment',
    description: 'Checks if a subject is appropriate for a specific class grade level'
  })
  @ApiParam({ name: 'subjectId', description: 'Subject ID', example: 'subject-123' })
  @ApiParam({ name: 'classId', description: 'Class ID', example: 'class-123' })
  @ListDocs('Validation result for subject-class assignment')
  validateAssignment(
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
    @Param('subjectId') subjectId: string,
    @Param('classId') classId: string,
  ) {
    return this.subjectsService.validateSubjectClassAssignment(subjectId, classId);
  }

  @Get('inappropriate-assignments')
  @ApiOperation({ 
    summary: 'Get inappropriate subject assignments',
    description: 'Lists all subject-class assignments that are educationally inappropriate (e.g., Physics for Nursery)'
  })
  @ListDocs('List of inappropriate subject-class assignments')
  getInappropriateAssignments(
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.subjectsService.getInappropriateAssignments();
  }

  @Get('subject-teacher-class-mapping')
  @ApiOperation({ 
    summary: 'Get subject-teacher-class mapping overview',
    description: 'Shows current assignments of subjects to teachers and classes with appropriateness validation'
  })
  @ListDocs('Subject-teacher-class mapping with validation')
  getSubjectTeacherClassMapping(
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.subjectsService.getSubjectTeacherClassMapping();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get subject by ID',
    description: 'Retrieves detailed information about a specific subject'
  })
  @ApiParam({ name: 'id', description: 'Subject ID', example: 'subject-123' })
  @ListDocs('Subject details')
  async findOne(
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
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
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
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
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
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
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
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