import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
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

  @Post('periods/check-conflicts')
  @ApiOperation({ 
    summary: 'Check scheduling conflicts',
    description: 'Validates if a new period would create conflicts with existing timetable entries'
  })
  @ApiBody({
    description: 'Conflict check data',
    schema: {
      type: 'object',
      properties: {
        sectionId: { type: 'string', description: 'Section/Class ID', example: 'section-123' },
        teacherId: { type: 'string', description: 'Teacher ID', example: 'teacher-789' },
        roomId: { type: 'string', description: 'Room ID (optional)', example: 'room-101' },
        timeSlotId: { type: 'string', description: 'Time slot ID', example: 'timeslot-abc' },
        effectiveFrom: { type: 'string', format: 'date', description: 'Effective from date', example: '2024-01-15' }
      },
      required: ['sectionId', 'teacherId', 'timeSlotId']
    }
  })
  @ListDocs('Conflict check results')
  checkConflicts(
    @Body() data: {
      sectionId: string;
      teacherId: string;
      roomId?: string;
      timeSlotId: string;
      effectiveFrom?: string;
    },
  ) {
    return this.timetableService.checkPeriodConflicts({
      ...data,
      effectiveFrom: data.effectiveFrom
        ? new Date(data.effectiveFrom)
        : undefined,
    });
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
}