import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { TimetableService } from './timetable.service';
import { CreateTimeSlotDto } from './dto/create-timeslot.dto';
import { CreateSubstitutionDto } from './dto/create-substitution.dto';
import { ListDocs, CreateDocs, UpdateDocs } from '../../common/swagger.decorators';

@ApiTags('Timetable')
@Controller('timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

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
    @Query('isActive') isActive?: string,
    @Query('sectionId') sectionId?: string,
    @Query('teacherId') teacherId?: string,
  ) {
    return this.timetableService.getPeriods({
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 25,
      sort,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      sectionId,
      teacherId,
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
        timeSlotId: { type: 'string', description: 'Time slot ID', example: 'timeslot-abc' },
        effectiveFrom: { type: 'string', format: 'date', description: 'Effective from date', example: '2024-01-15' }
      },
      required: ['sectionId', 'subjectId', 'teacherId', 'timeSlotId']
    }
  })
  @CreateDocs('Period created successfully')
  createPeriod(
    @Body() createPeriodDto: {
      sectionId: string;
      subjectId: string;
      teacherId: string;
      roomId?: string;
      timeSlotId: string;
      effectiveFrom?: string;
    },
  ) {
    return this.timetableService.createPeriod({
      ...createPeriodDto,
      effectiveFrom: createPeriodDto.effectiveFrom
        ? new Date(createPeriodDto.effectiveFrom)
        : undefined,
    });
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
    summary: 'Get substitutions by date',
    description: 'Retrieves all substitutions scheduled for a specific date'
  })
  @ApiQuery({ name: 'date', description: 'Date to check substitutions (ISO format)', example: '2024-01-15' })
  @ListDocs('List of substitutions for the specified date')
  getSubstitutions(@Query('date') date: string) {
    if (!date) {
      throw new BadRequestException('Date is required');
    }
    return this.timetableService.getSubstitutions(new Date(date));
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
      constraints?: Array<{
        type: string;
        value: any;
      }>;
    },
  ) {
    return this.timetableService.generateTimetable(generateDto);
  }

  @Post('save')
  @ApiOperation({ 
    summary: 'Save complete timetable',
    description: 'Saves a complete timetable with all periods for a section'
  })
  @ApiBody({
    description: 'Array of timetable periods to save',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sectionId: { type: 'string', description: 'Section ID', example: 'section-123' },
          subjectId: { type: 'string', description: 'Subject ID', example: 'subject-456' },
          teacherId: { type: 'string', description: 'Teacher ID', example: 'teacher-789' },
          roomId: { type: 'string', description: 'Room ID (optional)', example: 'room-101' },
          timeSlotId: { type: 'string', description: 'Time slot ID', example: 'timeslot-abc' }
        },
        required: ['sectionId', 'subjectId', 'teacherId', 'timeSlotId']
      }
    }
  })
  @CreateDocs('Timetable saved successfully')
  saveTimetable(
    @Body() periods: Array<{
      sectionId: string;
      subjectId: string;
      teacherId: string;
      roomId?: string;
      timeSlotId: string;
    }>,
  ) {
    return this.timetableService.saveTimetable(periods);
  }

  @Get('analytics/teacher-workload')
  @ApiOperation({ 
    summary: 'Get teacher workload analytics',
    description: 'Retrieves analytics on teacher workload distribution and utilization'
  })
  @ListDocs('Teacher workload statistics and analytics')
  getTeacherWorkload() {
    return this.timetableService.getTeacherWorkload();
  }

  @Get('analytics/room-occupancy')
  @ApiOperation({ 
    summary: 'Get room occupancy analytics',
    description: 'Retrieves analytics on room utilization and occupancy rates'
  })
  @ListDocs('Room occupancy statistics and analytics')
  getRoomOccupancy() {
    return this.timetableService.getRoomOccupancy();
  }

  @Post('generate-complete')
  @ApiOperation({ 
    summary: 'Generate complete school timetable',
    description: 'Generates a comprehensive weekly timetable for all sections with teacher assignments'
  })
  @ApiBody({
    description: 'Branch ID for timetable generation',
    schema: {
      type: 'object',
      properties: {
        branchId: { type: 'string', description: 'Branch ID (optional)', example: 'branch1' }
      }
    }
  })
  @CreateDocs('Complete timetable generated successfully')
  async generateCompleteTimetable(
    @Body('branchId') branchId?: string,
  ) {
    return this.timetableService.generateCompleteTimetable(branchId);
  }

  @Post('save-periods')
  @ApiOperation({ 
    summary: 'Save generated timetable periods',
    description: 'Saves all generated periods to the database as the active timetable'
  })
  @ApiBody({
    description: 'Generated periods and branch ID',
    schema: {
      type: 'object',
      properties: {
        periods: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              sectionId: { type: 'string' },
              subjectId: { type: 'string' },
              teacherId: { type: 'string' },
              timeSlotId: { type: 'string' },
              roomId: { type: 'string' }
            }
          }
        },
        branchId: { type: 'string', description: 'Branch ID (optional)' }
      },
      required: ['periods']
    }
  })
  @CreateDocs('Timetable periods saved successfully')
  async saveTimetablePeriods(
    @Body() data: { periods: any[]; branchId?: string },
  ) {
    return this.timetableService.saveTimetablePeriods(data.periods, data.branchId);
  }

  @Get('grid/:sectionId')
  @ApiOperation({ 
    summary: 'Get timetable grid data for a section',
    description: 'Returns weekly timetable grid organized by days and time slots'
  })
  @ApiParam({ name: 'sectionId', description: 'Section ID' })
  @ListDocs('Timetable grid data')
  async getTimetableGrid(
    @Param('sectionId') sectionId: string,
  ) {
    return this.timetableService.getTimetableGrid(sectionId);
  }

  @Post('check-conflicts')
  @ApiOperation({ 
    summary: 'Check for teacher scheduling conflicts',
    description: 'Validates if changing a period would create teacher conflicts'
  })
  @ApiBody({
    description: 'Period change data for conflict checking',
    schema: {
      type: 'object',
      properties: {
        periodId: { type: 'string', description: 'Period being changed (optional for new periods)' },
        teacherId: { type: 'string', description: 'New teacher ID' },
        timeSlotId: { type: 'string', description: 'Time slot ID' },
        date: { type: 'string', format: 'date', description: 'Date for conflict checking (optional)' }
      },
      required: ['teacherId', 'timeSlotId']
    }
  })
  @CreateDocs('Conflict check results')
  async checkConflicts(
    @Body() data: {
      periodId?: string;
      teacherId: string;
      timeSlotId: string;
      date?: string;
    },
  ) {
    return this.timetableService.checkTeacherConflicts(data);
  }

  @Patch('periods/:id')
  @ApiOperation({ 
    summary: 'Update timetable period',
    description: 'Updates a specific timetable period with conflict checking'
  })
  @ApiParam({ name: 'id', description: 'Period ID' })
  @ApiBody({
    description: 'Period update data',
    schema: {
      type: 'object',
      properties: {
        teacherId: { type: 'string', description: 'Teacher ID' },
        subjectId: { type: 'string', description: 'Subject ID' },
        roomId: { type: 'string', description: 'Room ID' }
      }
    }
  })
  @UpdateDocs('Period updated successfully')
  async updatePeriod(
    @Param('id') id: string,
    @Body() updateData: {
      teacherId?: string;
      subjectId?: string;
      roomId?: string;
    },
  ) {
    return this.timetableService.updatePeriod(id, updateData);
  }
}