import { DEFAULT_BRANCH_ID } from '../../common/constants';
import { Controller, Get, Post, Put, Delete, Param, Query, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';

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
@Controller('attendance-records')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of attendance records' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (starts from 1)' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'perPage', required: false, type: Number, description: 'Number of items per page (alias for pageSize)' })
  @ApiQuery({ name: 'sort', required: false, type: String, description: 'Sort field (e.g., "date:desc" or "-date")' })
  @ApiQuery({ name: 'filter', required: false, type: String, description: 'Filter JSON string' })
  @ApiQuery({ name: 'ids', required: false, type: [String], description: 'Get multiple records by IDs' })
  async getList(
    @Query('ids') ids?: string | string[],
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sort') sort?: string,
    @Query() query?: Record<string, any>,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    // Handle getMany case (when ids are provided)
    if (ids) {
      const idArray = Array.isArray(ids) ? ids : (typeof ids === 'string' ? ids.split(',') : [ids]);
      return this.attendanceService.getMany(idArray, branchId);
    }
    
    // Remove pagination params from query to get filters
    const { page: _p, perPage: _pp, pageSize: _ps, sort: _s, filter: filterStr, ...restQuery } = query || {};
    
    // Parse filter if it's a JSON string
    let filter = {};
    if (filterStr) {
      try {
        filter = typeof filterStr === 'string' ? JSON.parse(filterStr) : filterStr;
      } catch (e) {
        // If parsing fails, treat as empty filter
        filter = {};
      }
    }
    
    // Merge any remaining query params as filters
    filter = { ...filter, ...restQuery };
    
    return this.attendanceService.getList({
      page: page ? Number(page) : 1,
      perPage: perPage ? Number(perPage) : (pageSize ? Number(pageSize) : 25),
      sort,
      filter,
      branchId, // Pass branchId to service
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single attendance record by ID' })
  async getOne(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.attendanceService.getOne(id, branchId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new attendance record' })
  async create(
    @Body() data: CreateAttendanceDto,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.attendanceService.create({ ...data, branchId });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update attendance record (full replacement)' })
  async update(
    @Param('id') id: string,
    @Body() data: UpdateAttendanceDto,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.attendanceService.update(id, data, branchId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete attendance record' })
  async remove(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
    @Headers('x-user-id') userId?: string,
  ) {
    return this.attendanceService.delete(id, userId, branchId);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete multiple attendance records' })
  async deleteMany(
    @Body() body: { ids: string[] },
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
    @Headers('x-user-id') userId?: string,
  ) {
    // Validate that all records exist in this branch first
    await this.attendanceService.getMany(body.ids, branchId);
    
    // Delete all records
    const deletedIds: string[] = [];
    for (const id of body.ids) {
      try {
        await this.attendanceService.delete(id, userId);
        deletedIds.push(id);
      } catch (error) {
        // Continue with other deletions even if one fails
        console.error(`Failed to delete attendance record ${id}:`, error);
      }
    }
    
    return { data: deletedIds };
  }

  // Additional endpoints for backward compatibility and extended functionality
  @Post('generate-dummy')
  @ApiOperation({ 
    summary: 'Generate dummy attendance data',
    description: 'Generates realistic attendance records for all active students for a given date. Useful for development and testing.'
  })
  generateDummy(
    @Body() body: GenerateDummyAttendanceDto,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.attendanceService.generateDummyAttendance(body);
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
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.attendanceService.getStudentAttendanceSummary(studentId, startDate, endDate);
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
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.attendanceService.getSectionAttendanceReport(sectionId, date);
  }

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get attendance dashboard statistics' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Date for statistics (defaults to today)' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date for range statistics' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date for range statistics' })
  @ApiQuery({ name: 'classId', required: false, type: String, description: 'Filter by class ID' })
  @ApiQuery({ name: 'sectionId', required: false, type: String, description: 'Filter by section ID' })
  async getDashboardStats(
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('classId') classId?: string,
    @Query('sectionId') sectionId?: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.attendanceService.getDashboardStats(branchId, { date, startDate, endDate, classId, sectionId });
  }

  @Get('reports/class-section-summary')
  @ApiOperation({ summary: 'Get class and section wise attendance summary' })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Date for summary (defaults to today)' })
  async getClassSectionSummary(
    @Query('date') date?: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.attendanceService.getClassSectionSummary(branchId, date);
  }

  @Get('analytics/trends')
  @ApiOperation({ summary: 'Get attendance trends over time' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days for trend analysis (default: 30)' })
  @ApiQuery({ name: 'granularity', required: false, enum: ['daily', 'weekly', 'monthly'], description: 'Trend granularity' })
  async getAttendanceTrends(
    @Query('days') days?: string,
    @Query('granularity') granularity?: 'daily' | 'weekly' | 'monthly',
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.attendanceService.getAttendanceTrends(
      branchId,
      days ? Number(days) : 30,
      granularity || 'daily'
    );
  }
}