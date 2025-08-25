import { DEFAULT_BRANCH_ID } from '../../common/constants';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  Headers,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { TimetableService } from './timetable.service';
import { PeriodsService } from './periods.service';
import { CreateTimeSlotDto } from './dto/create-timeslot.dto';
import { CreateSubstitutionDto } from './dto/create-substitution.dto';
import { ListDocs, CreateDocs, UpdateDocs } from '../../common/swagger.decorators';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Timetable')
@Controller('timetable')
export class TimetableController {
  constructor(
    private readonly timetableService: TimetableService,
    private readonly periodsService: PeriodsService,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all timetable periods',
    description: 'Retrieves all timetable periods with optional filtering and pagination for React Admin'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'perPage', required: false, description: 'Items per page', example: 25 })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Page size (alias for perPage)', example: 25 })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field and direction', example: 'class.gradeLevel' })
  @ApiQuery({ name: 'ids', required: false, description: 'Comma-separated list of IDs for getMany operation' })
  @ApiQuery({ name: 'filter', required: false, description: 'Filter object as JSON string' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ListDocs('List of timetable periods')
  async getList(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sort') sort?: string,
    @Query('ids') ids?: string | string[],
    @Query() query?: Record<string, any>,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    // Handle getMany case (when ids are provided)
    if (ids) {
      const idArray = Array.isArray(ids) ? ids : (typeof ids === 'string' ? ids.split(',') : [ids]);
      return this.periodsService.getMany(idArray);
    }
    
    // Extract known params from query to get filters
    const { 
      page: _p, 
      perPage: _pp, 
      pageSize: _ps, 
      sort: _s, 
      filter: filterStr, 
      q, // Extract search query
      ids: _ids, 
      ...restQuery 
    } = query || {};
    
    // Parse filter if it's a JSON string
    let filter = {};
    if (filterStr) {
      try {
        filter = typeof filterStr === 'string' ? JSON.parse(filterStr) : filterStr;
      } catch (e) {
        filter = {};
      }
    }
    
    // Merge any remaining query params as filters
    filter = { ...filter, ...restQuery };
    
    return this.periodsService.getList({
      page: page ? Number(page) : 1,
      perPage: perPage ? Number(perPage) : (pageSize ? Number(pageSize) : 25),
      sort,
      filter,
      q, // Pass search query separately
      branchId,
    });
  }

  @Post('time-slots')
  @ApiOperation({ 
    summary: 'Create time slot',
    description: 'Creates a new time slot with day, start time, and end time for scheduling periods'
  })
  @CreateDocs('Time slot created successfully')
  createTimeSlot(@Body() createTimeSlotDto: CreateTimeSlotDto) {
    return this.timetableService.createTimeSlot(createTimeSlotDto);
  }

  @Get('time-slots')
  @ApiOperation({ 
    summary: 'Get all time slots',
    description: 'Retrieves all available time slots for timetable scheduling'
  })
  @ListDocs('List of all time slots')
  getTimeSlots() {
    return this.timetableService.getTimeSlots();
  }

  @Get('time-slots/:id')
  @ApiOperation({ 
    summary: 'Get time slot by ID',
    description: 'Retrieves a specific time slot with all details'
  })
  @ApiParam({ name: 'id', description: 'Time slot ID', example: 'timeslot-123' })
  @ListDocs('Time slot details')
  getTimeSlot(@Param('id') id: string) {
    return this.timetableService.getTimeSlot(id);
  }

  @Get('periods')
  @ApiOperation({ 
    summary: 'Get all timetable periods',
    description: 'Retrieves all timetable periods with optional filtering and pagination'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Page size', example: 25 })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field and direction', example: '-effectiveFrom' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status', example: 'true' })
  @ApiQuery({ name: 'sectionId', required: false, description: 'Filter by section ID' })
  @ApiQuery({ name: 'teacherId', required: false, description: 'Filter by teacher ID' })
  @ListDocs('List of timetable periods')
  getPeriods(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sort') sort?: string,
    @Query('sectionId') sectionId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.timetableService.getPeriods({
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 25,
      sort,
      sectionId,
      teacherId,
      academicYearId,
    });
  }

  @Get('periods/:id')
  @ApiOperation({ 
    summary: 'Get timetable period by ID',
    description: 'Retrieves a specific timetable period with all related data'
  })
  @ApiParam({ name: 'id', description: 'Period ID', example: 'period-123' })
  @ListDocs('Timetable period details')
  getPeriod(@Param('id') id: string) {
    return this.timetableService.getPeriod(id);
  }

  @Post('periods')
  @ApiOperation({ 
    summary: 'Create timetable period',
    description: 'Creates a new period in the timetable with subject, teacher, room, and time slot assignment'
  })
  @ApiBody({
    description: 'Period creation data',
    schema: {
      type: 'object',
      properties: {
        sectionId: { type: 'string', description: 'Section/Class ID', example: 'section-123' },
        subjectId: { type: 'string', description: 'Subject ID', example: 'subject-456' },
        teacherId: { type: 'string', description: 'Teacher ID', example: 'teacher-789' },
        roomId: { type: 'string', description: 'Room ID (optional)', example: 'room-101' },
        dayOfWeek: { type: 'number', description: 'Day of week (1-6)', example: 1 },
        periodNumber: { type: 'number', description: 'Period number', example: 1 },
        startTime: { type: 'string', description: 'Start time (HH:MM)', example: '09:00' },
        endTime: { type: 'string', description: 'End time (HH:MM)', example: '09:45' },
        academicYearId: { type: 'string', description: 'Academic year ID', example: 'year-123' },
        isBreak: { type: 'boolean', description: 'Is this a break period', example: false },
        breakType: { type: 'string', description: 'Type of break (if isBreak=true)', example: 'LUNCH' }
      },
      required: ['sectionId', 'dayOfWeek', 'periodNumber', 'startTime', 'endTime', 'academicYearId']
    }
  })
  @CreateDocs('Period created successfully')
  createPeriod(
    @Body() createPeriodDto: {
      sectionId: string;
      subjectId?: string;
      teacherId?: string;
      roomId?: string;
      dayOfWeek: number;
      periodNumber: number;
      startTime: string;
      endTime: string;
      academicYearId: string;
      isBreak?: boolean;
      breakType?: string;
    },
  ) {
    return this.timetableService.createPeriod(createPeriodDto);
  }

  @Delete('periods/:id')
  @ApiOperation({ 
    summary: 'Delete timetable period',
    description: 'Deletes a specific timetable period'
  })
  @ApiParam({ name: 'id', description: 'Period ID', example: 'period-123' })
  @UpdateDocs('Period deleted successfully')
  deletePeriod(@Param('id') id: string) {
    return this.timetableService.deletePeriod(id);
  }


  @Get('sections/:sectionId')
  @ApiOperation({ 
    summary: 'Get section timetable',
    description: 'Retrieves the complete timetable for a specific section/class'
  })
  @ApiParam({ name: 'sectionId', description: 'Section ID', example: 'section-123' })
  @ListDocs('Section timetable with all periods')
  getSectionTimetable(@Param('sectionId') sectionId: string) {
    return this.timetableService.getSectionTimetable(sectionId);
  }

  @Get('teachers/:teacherId')
  @ApiOperation({ 
    summary: 'Get teacher timetable',
    description: 'Retrieves the complete teaching schedule for a specific teacher'
  })
  @ApiParam({ name: 'teacherId', description: 'Teacher ID', example: 'teacher-789' })
  @ListDocs('Teacher timetable with all assigned periods')
  getTeacherTimetable(@Param('teacherId') teacherId: string) {
    return this.timetableService.getTeacherTimetable(teacherId);
  }

  @Post('substitutions')
  @ApiOperation({ 
    summary: 'Create substitution',
    description: 'Creates a teacher or room substitution for a specific period and date'
  })
  @ApiBody({
    description: 'Substitution details',
    schema: {
      type: 'object',
      properties: {
        periodId: { type: 'string', description: 'Original period ID', example: 'period-123' },
        date: { type: 'string', format: 'date', description: 'Substitution date', example: '2024-01-15' },
        substituteTeacherId: { type: 'string', description: 'Substitute teacher ID', example: 'teacher-456' },
        substituteRoomId: { type: 'string', description: 'Substitute room ID', example: 'room-202' },
        reason: { type: 'string', description: 'Reason for substitution', example: 'Teacher on leave' }
      },
      required: ['periodId', 'date']
    }
  })
  @CreateDocs('Substitution created successfully')
  createSubstitution(
    @Body() createSubstitutionDto: {
      periodId: string;
      date: string;
      substituteTeacherId?: string;
      substituteRoomId?: string;
      reason?: string;
    },
  ) {
    if (!createSubstitutionDto.date) {
      throw new BadRequestException('Date is required');
    }
    
    return this.timetableService.createSubstitution({
      ...createSubstitutionDto,
      date: new Date(createSubstitutionDto.date),
    });
  }

  @Patch('substitutions/:id/approve')
  @ApiOperation({ 
    summary: 'Approve substitution',
    description: 'Approves a pending substitution request with approval authority'
  })
  @ApiParam({ name: 'id', description: 'Substitution ID', example: 'substitution-123' })
  @ApiBody({
    description: 'Approval data',
    schema: {
      type: 'object',
      properties: {
        approvedBy: { type: 'string', description: 'ID of approving authority', example: 'admin-456' }
      },
      required: ['approvedBy']
    }
  })
  @UpdateDocs('Substitution approved successfully')
  approveSubstitution(
    @Param('id') id: string,
    @Body('approvedBy') approvedBy: string,
  ) {
    return this.timetableService.approveSubstitution(id, approvedBy);
  }

  @Get('substitutions')
  @ApiOperation({ 
    summary: 'Get substitutions',
    description: 'Retrieves all substitutions with optional filtering and pagination for React Admin'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'perPage', required: false, description: 'Items per page', example: 25 })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Page size (alias for perPage)', example: 25 })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field and direction', example: 'id' })
  @ApiQuery({ name: 'ids', required: false, description: 'Comma-separated list of IDs for getMany operation' })
  @ApiQuery({ name: 'filter', required: false, description: 'Filter object as JSON string' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ApiQuery({ name: 'date', required: false, description: 'Date to check substitutions (ISO format)', example: '2024-01-15' })
  @ListDocs('List of substitutions')
  async getSubstitutions(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sort') sort?: string,
    @Query('ids') ids?: string | string[],
    @Query() query?: Record<string, any>,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    // Handle getMany case (when ids are provided)
    if (ids) {
      const idArray = Array.isArray(ids) ? ids : (typeof ids === 'string' ? ids.split(',') : [ids]);
      return this.timetableService.getManySubstitutions(idArray, branchId);
    }
    
    // Extract known params from query to get filters
    const { 
      page: _p, 
      perPage: _pp, 
      pageSize: _ps, 
      sort: _s, 
      filter: filterStr, 
      q, // Extract search query
      ids: _ids, 
      date,
      ...restQuery 
    } = query || {};
    
    // Parse filter if it's a JSON string
    let filter = {};
    if (filterStr) {
      try {
        filter = typeof filterStr === 'string' ? JSON.parse(filterStr) : filterStr;
      } catch (e) {
        filter = {};
      }
    }
    
    // Merge any remaining query params as filters
    filter = { ...filter, ...restQuery };
    
    return this.timetableService.getSubstitutionsList({
      page: page ? Number(page) : 1,
      perPage: perPage ? Number(perPage) : (pageSize ? Number(pageSize) : 25),
      sort,
      filter,
      q, // Pass search query separately
      branchId,
      date: date ? new Date(date) : undefined,
    });
  }

  @Post('generate')
  @ApiOperation({ 
    summary: 'Generate automatic timetable',
    description: 'Uses AI algorithms to automatically generate optimized timetable based on constraints and allocations'
  })
  @ApiBody({
    description: 'Timetable generation parameters',
    schema: {
      type: 'object',
      properties: {
        sectionId: { type: 'string', description: 'Section ID for timetable generation', example: 'section-123' },
        subjectAllocations: {
          type: 'array',
          description: 'Subject teaching allocations',
          items: {
            type: 'object',
            properties: {
              subjectId: { type: 'string', description: 'Subject ID', example: 'subject-456' },
              teacherId: { type: 'string', description: 'Teacher ID', example: 'teacher-789' },
              periodsPerWeek: { type: 'number', description: 'Periods per week', example: 5 },
              preferredRoomId: { type: 'string', description: 'Preferred room ID', example: 'room-101' }
            },
            required: ['subjectId', 'teacherId', 'periodsPerWeek']
          }
        },
        constraints: {
          type: 'array',
          description: 'Additional scheduling constraints',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', description: 'Constraint type', example: 'no_consecutive_periods' },
              value: { description: 'Constraint value', example: 'MATH101' }
            }
          }
        }
      },
      required: ['sectionId', 'subjectAllocations']
    }
  })
  @CreateDocs('Timetable generated successfully')
  generateTimetable(
    @Body() generateDto: {
      sectionId: string;
      subjectAllocations: Array<{
        subjectId: string;
        teacherId: string;
        periodsPerWeek: number;
        preferredRoomId?: string;
      }>;
      academicYearId: string;
      constraints?: Array<{
        type: string;
        value: any;
      }>;
    },
  ) {
    return this.timetableService.generateTimetable(generateDto);
  }

  // Removed saveTimetable endpoint - method doesn't exist in service

  // Removed getTeacherWorkload endpoint - method doesn't exist in service

  // Removed getRoomOccupancy endpoint - method doesn't exist in service

  // Removed generateCompleteTimetable endpoint - method doesn't exist in service

  // Removed saveTimetablePeriods endpoint - method doesn't exist in service

  // Removed getTimetableGrid endpoint - method doesn't exist in service

  // Removed checkConflicts endpoint - checkTeacherConflicts method doesn't exist in service

  // Removed updatePeriod endpoint - method doesn't exist in service

  // Generic :id route must be last to avoid matching specific routes
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get timetable period by ID',
    description: 'Retrieves a specific timetable period with all related data for React Admin'
  })
  @ApiParam({ name: 'id', description: 'Timetable period ID', example: '9493ed5a-38ef-4a29-99c0-1bb849828ef1' })
  async getOne(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.timetableService.getOne(id, branchId);
  }
}