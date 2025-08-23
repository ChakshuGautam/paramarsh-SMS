import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiProperty, ApiPropertyOptional, ApiOperation } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateDocs, DeleteDocs, ListDocs, UpdateDocs } from '../../common/swagger.decorators';
import { IsOptional, IsString, IsUUID, IsDateString, IsNumber } from 'class-validator';

class UpsertAttendanceDto {
  @ApiProperty({
    description: 'Unique identifier of the student whose attendance is being recorded',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @IsString()
  @IsUUID()
  studentId!: string;

  @ApiProperty({
    description: 'Date of the attendance record in ISO date format',
    example: '2024-08-12',
    format: 'date'
  })
  @IsString()
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({
    description: 'Attendance status for the given date',
    example: 'present',
    enum: ['present', 'absent', 'late', 'excused', 'sick', 'partial']
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Reason for absence or late arrival',
    example: 'Doctor appointment',
    maxLength: 200
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Identifier of the person who marked the attendance',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid'
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  markedBy?: string;

  @ApiPropertyOptional({
    description: 'Source system or method used to record attendance',
    example: 'manual',
    enum: ['manual', 'biometric', 'rfid', 'mobile_app', 'web_portal', 'import']
  })
  @IsOptional()
  @IsString()
  source?: string;
}

class GenerateDummyAttendanceDto {
  @ApiPropertyOptional({
    description: 'Date for which to generate attendance (defaults to today)',
    example: '2024-08-15',
    format: 'date'
  })
  @IsOptional()
  @IsString()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Percentage of students to mark as present (0-100)',
    example: 85,
    default: 85,
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  presentPercentage?: number;

  @ApiPropertyOptional({
    description: 'Percentage of absent students who are marked as sick',
    example: 20,
    default: 20,
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  sickPercentage?: number;

  @ApiPropertyOptional({
    description: 'Percentage of present students who are marked as late',
    example: 10,
    default: 10,
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  latePercentage?: number;
}

@ApiTags('Attendance')
@Controller('attendance/records')
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Get()
  @ListDocs('List attendance records')
  @ApiQuery({ name: 'studentId', required: false })
  list(
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('sort') sort?: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.service.list({ page, perPage, sort, studentId });
  }

  @Post()
  @CreateDocs('Create attendance record')
  create(
    @Body() body: UpsertAttendanceDto,
    @Headers('x-branch-id') branchId = 'branch1',
  ) {
    return this.service.create({ ...body, branchId });
  }

  @Patch(':id')
  @UpdateDocs('Update attendance record')
  update(@Param('id') id: string, @Body() body: Partial<UpsertAttendanceDto>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @DeleteDocs('Delete attendance record')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post('generate-dummy')
  @ApiOperation({ 
    summary: 'Generate dummy attendance data',
    description: 'Generates realistic attendance records for all active students for a given date. Useful for development and testing.'
  })
  @CreateDocs('Generate dummy attendance')
  generateDummy(@Body() body: GenerateDummyAttendanceDto) {
    return this.service.generateDummyAttendance(body);
  }

  @Get('student/:studentId/summary')
  @ApiOperation({
    summary: 'Get student attendance summary',
    description: 'Get period-based attendance summary for a student within a date range'
  })
  @ApiQuery({ name: 'startDate', required: true, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: true, example: '2024-12-31' })
  getStudentSummary(
    @Param('studentId') studentId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.service.getStudentAttendanceSummary(studentId, startDate, endDate);
  }

  @Get('section/:sectionId/report')
  @ApiOperation({
    summary: 'Get section attendance report',
    description: 'Get attendance matrix for all students in a section for a specific date'
  })
  @ApiQuery({ name: 'date', required: true, example: '2024-08-15' })
  getSectionReport(
    @Param('sectionId') sectionId: string,
    @Query('date') date: string,
  ) {
    return this.service.getSectionAttendanceReport(sectionId, date);
  }
}
