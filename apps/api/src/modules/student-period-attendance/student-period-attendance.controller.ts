import { DEFAULT_BRANCH_ID } from '../../common/constants';
import { Controller, Get, Post, Put, Delete, Param, Query, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StudentPeriodAttendanceService } from './student-period-attendance.service';
import { CreateStudentPeriodAttendanceDto } from './dto/create-student-period-attendance.dto';
import { UpdateStudentPeriodAttendanceDto } from './dto/update-student-period-attendance.dto';

@ApiTags('Student Period Attendance')
@Controller('studentPeriodAttendance')
export class StudentPeriodAttendanceController {
  constructor(private readonly studentPeriodAttendanceService: StudentPeriodAttendanceService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of student period attendance records' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (starts from 1)' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'perPage', required: false, type: Number, description: 'Number of items per page (alias for pageSize)' })
  @ApiQuery({ name: 'sort', required: false, type: String, description: 'Sort field (e.g., "markedAt:desc" or "-markedAt")' })
  @ApiQuery({ name: 'filter', required: false, type: String, description: 'Filter JSON string' })
  @ApiQuery({ name: 'ids', required: false, type: [String], description: 'Get multiple records by IDs' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Search query' })
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
      return this.studentPeriodAttendanceService.getMany(idArray, branchId);
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
    
    return this.studentPeriodAttendanceService.getList({
      page: page ? Number(page) : 1,
      perPage: perPage ? Number(perPage) : (pageSize ? Number(pageSize) : 25),
      sort,
      filter,
      q, // Pass search query separately
      branchId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single student period attendance record by ID' })
  async getOne(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.studentPeriodAttendanceService.getOne(id, branchId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new student period attendance record' })
  async create(
    @Body() data: CreateStudentPeriodAttendanceDto,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.studentPeriodAttendanceService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update student period attendance record (full replacement)' })
  async update(
    @Param('id') id: string,
    @Body() data: UpdateStudentPeriodAttendanceDto,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    // Verify entity exists in this branch before updating
    await this.studentPeriodAttendanceService.getOne(id, branchId);
    return this.studentPeriodAttendanceService.update(id, data, branchId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete student period attendance record' })
  async remove(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
    @Headers('x-user-id') userId?: string,
  ) {
    // Verify entity exists in this branch before deleting
    await this.studentPeriodAttendanceService.getOne(id, branchId);
    return this.studentPeriodAttendanceService.delete(id, userId, branchId);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete multiple student period attendance records' })
  async deleteMany(
    @Body() body: { ids: string[] },
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
    @Headers('x-user-id') userId?: string,
  ) {
    // Validate that all records exist in this branch first
    await this.studentPeriodAttendanceService.getMany(body.ids, branchId);
    
    // Delete all records
    const deletedIds: string[] = [];
    for (const id of body.ids) {
      try {
        await this.studentPeriodAttendanceService.delete(id, userId, branchId);
        deletedIds.push(id);
      } catch (error) {
        // Continue with other deletions even if one fails
        console.error(`Failed to delete student period attendance record ${id}:`, error);
      }
    }
    
    return { data: deletedIds };
  }

  // Additional endpoints for extended functionality
  @Get('student/:studentId/summary')
  @ApiOperation({
    summary: 'Get student period attendance summary',
    description: 'Get attendance summary for a student across all periods within a date range'
  })
  @ApiQuery({ name: 'startDate', required: false, type: String, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, type: String, example: '2024-12-31' })
  async getStudentSummary(
    @Param('studentId') studentId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.studentPeriodAttendanceService.getStudentSummary(studentId, startDate, endDate, branchId);
  }

  @Get('session/:sessionId/report')
  @ApiOperation({
    summary: 'Get session attendance report',
    description: 'Get attendance report for all students in a specific session'
  })
  async getSessionReport(
    @Param('sessionId') sessionId: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    return this.studentPeriodAttendanceService.getSessionReport(sessionId, branchId);
  }

  @Get('analytics/patterns')
  @ApiOperation({
    summary: 'Get attendance patterns analysis',
    description: 'Analyze attendance patterns by student, subject, or time period'
  })
  @ApiQuery({ name: 'type', required: false, enum: ['student', 'subject', 'period'], description: 'Analysis type' })
  @ApiQuery({ name: 'startDate', required: false, type: String, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, type: String, example: '2024-12-31' })
  @ApiQuery({ name: 'studentId', required: false, type: String, description: 'Filter by student ID' })
  @ApiQuery({ name: 'subjectId', required: false, type: String, description: 'Filter by subject ID' })
  async getAttendancePatterns(
    @Query('type') type?: 'student' | 'subject' | 'period',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('studentId') studentId?: string,
    @Query('subjectId') subjectId?: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    // Build filter based on query parameters
    const filter: any = {};
    if (studentId) filter.studentId = studentId;
    if (subjectId) filter.subjectId = subjectId;
    if (startDate || endDate) {
      if (startDate) filter.date_gte = startDate;
      if (endDate) filter.date_lte = endDate;
    }

    return this.studentPeriodAttendanceService.getList({
      page: 1,
      perPage: 1000, // Get more records for analysis
      filter,
      branchId,
    });
  }

  @Get('reports/subject-wise')
  @ApiOperation({
    summary: 'Get subject-wise attendance report',
    description: 'Get attendance statistics grouped by subject'
  })
  @ApiQuery({ name: 'startDate', required: false, type: String, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, type: String, example: '2024-12-31' })
  @ApiQuery({ name: 'sectionId', required: false, type: String, description: 'Filter by section' })
  async getSubjectWiseReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sectionId') sectionId?: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    const filter: any = {};
    if (sectionId) filter.sectionId = sectionId;
    if (startDate) filter.date_gte = startDate;
    if (endDate) filter.date_lte = endDate;

    return this.studentPeriodAttendanceService.getList({
      page: 1,
      perPage: 1000,
      filter,
      branchId,
    });
  }

  @Get('dashboard/stats')
  @ApiOperation({ 
    summary: 'Get attendance dashboard statistics',
    description: 'Get overall attendance statistics for dashboard display'
  })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Specific date for statistics' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date for range' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date for range' })
  async getDashboardStats(
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    const filter: any = {};
    
    if (date) {
      filter.date_gte = date;
      filter.date_lte = date;
    } else if (startDate || endDate) {
      if (startDate) filter.date_gte = startDate;
      if (endDate) filter.date_lte = endDate;
    } else {
      // Default to today
      const today = new Date().toISOString().split('T')[0];
      filter.date_gte = today;
      filter.date_lte = today;
    }

    const result = await this.studentPeriodAttendanceService.getList({
      page: 1,
      perPage: 10000, // Get all records for statistics
      filter,
      branchId,
    });

    // Calculate statistics
    const records = result.data || [];
    const stats = {
      totalRecords: records.length,
      present: records.filter((r: any) => r.status === 'present').length,
      absent: records.filter((r: any) => r.status === 'absent').length,
      late: records.filter((r: any) => r.status === 'late').length,
      excused: records.filter((r: any) => r.status === 'excused').length,
    };

    const attendanceRate = stats.totalRecords > 0 
      ? ((stats.present + stats.late) / stats.totalRecords * 100).toFixed(2)
      : '0.00';

    return {
      data: {
        ...stats,
        attendanceRate: parseFloat(attendanceRate),
        period: { date, startDate, endDate }
      }
    };
  }
}