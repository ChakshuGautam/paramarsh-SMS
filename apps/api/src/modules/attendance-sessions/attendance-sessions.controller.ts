import { DEFAULT_BRANCH_ID } from '../../common/constants';
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query,
  Patch,
  UseGuards,
  Request,
  Headers
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiQuery,
  ApiParam,
  ApiBearerAuth
} from '@nestjs/swagger';
import { AttendanceSessionsService } from './attendance-sessions.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { MarkStudentAttendanceDto } from './dto/mark-student-attendance.dto';
import { CreateDocs, ListDocs } from '../../common/swagger.decorators';

@ApiTags('Attendance Sessions')
@Controller('attendance/sessions')
export class AttendanceSessionsController {
  constructor(private readonly service: AttendanceSessionsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current period session for teacher' })
  @ApiQuery({ name: 'teacherId', required: false })
  async getCurrentSession(@Request() req: any, @Query('teacherId') teacherIdParam?: string) {
    // In a real app, get teacherId from the authenticated user
    const teacherId = req.user?.teacherId || teacherIdParam;
    if (!teacherId) {
      return { data: null, message: 'Teacher ID is required' };
    }
    return this.service.getCurrentSession(teacherId);
  }

  @Get('today')
  @ApiOperation({ summary: 'Get all today sessions for teacher' })
  @ApiQuery({ name: 'teacherId', required: false })
  async getTodaySessions(@Query('teacherId') teacherId?: string) {
    if (!teacherId) {
      return { data: [], message: 'Teacher ID is required' };
    }
    return this.service.getTodaysSessions(teacherId);
  }

  @Get()
  @ListDocs('List attendance sessions')
  @ApiQuery({ name: 'date', required: false, type: Date })
  @ApiQuery({ name: 'teacherId', required: false })
  @ApiQuery({ name: 'sectionId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async listSessions(
    @Query('date') date?: string,
    @Query('teacherId') teacherId?: string,
    @Query('sectionId') sectionId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.service.listSessions({
      date: date ? new Date(date) : undefined,
      teacherId,
      sectionId,
      status,
      page,
      pageSize
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session details' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  async getSession(@Param('id') id: string) {
    return this.service.getSession(id);
  }

  @Get(':id/roster')
  @ApiOperation({ summary: 'Get student roster for session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  async getSessionRoster(@Param('id') id: string) {
    return this.service.getSessionRoster(id);
  }

  @Post(':id/mark')
  @ApiOperation({ summary: 'Mark attendance for multiple students' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @CreateDocs('Mark attendance')
  async markAttendance(
    @Param('id') id: string,
    @Body() body: MarkAttendanceDto,
    @Request() req: any
  ) {
    // In a real app, get teacherId from the authenticated user
    const teacherId = req.user?.teacherId || body.teacherId;
    return this.service.markAttendance(id, body.markings, teacherId);
  }

  @Patch(':id/students/:studentId')
  @ApiOperation({ summary: 'Update individual student attendance' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  async markStudentAttendance(
    @Param('id') sessionId: string,
    @Param('studentId') studentId: string,
    @Body() body: MarkStudentAttendanceDto,
    @Request() req: any
  ) {
    // In a real app, get teacherId from the authenticated user
    const teacherId = req.user?.teacherId || body.teacherId;
    return this.service.markStudentAttendance(
      sessionId,
      studentId,
      body.status,
      teacherId,
      {
        minutesLate: body.minutesLate,
        reason: body.reason,
        notes: body.notes
      }
    );
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete and lock attendance session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  async completeSession(@Param('id') id: string) {
    return this.service.completeSession(id);
  }

  @Post(':id/bulk-present')
  @ApiOperation({ summary: 'Mark all students as present' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiQuery({ name: 'teacherId', required: false })
  async markAllPresent(
    @Param('id') sessionId: string,
    @Request() req: any,
    @Query('teacherId') teacherIdParam?: string
  ) {
    const { roster } = await this.service.getSessionRoster(sessionId);
    const teacherId = req.user?.teacherId || teacherIdParam;
    
    if (!teacherId) {
      throw new Error('Teacher ID is required');
    }
    
    const markings = roster.map(student => ({
      studentId: student.studentId,
      status: 'present',
      minutesLate: undefined,
      reason: undefined,
      notes: undefined
    }));
    
    return this.service.markAttendance(sessionId, markings, teacherId);
  }

  @Post(':id/bulk-absent')
  @ApiOperation({ summary: 'Mark all unmarked students as absent' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiQuery({ name: 'teacherId', required: false })
  async markUnmarkedAbsent(
    @Param('id') sessionId: string,
    @Request() req: any,
    @Query('teacherId') teacherIdParam?: string
  ) {
    const { roster } = await this.service.getSessionRoster(sessionId);
    const teacherId = req.user?.teacherId || teacherIdParam;
    
    if (!teacherId) {
      throw new Error('Teacher ID is required');
    }
    
    const unmarkedStudents = roster.filter(s => !s.status);
    const markings = unmarkedStudents.map(student => ({
      studentId: student.studentId,
      status: 'absent',
      minutesLate: undefined,
      reason: undefined,
      notes: undefined
    }));
    
    return this.service.markAttendance(sessionId, markings, teacherId);
  }

  @Post('generate-from-timetable')
  @ApiOperation({ 
    summary: 'Generate attendance sessions from timetable',
    description: 'Creates attendance sessions for all timetable periods on a given date'
  })
  async generateSessionsFromTimetable(
    @Body('date') date: string,
    @Headers('x-branch-id') branchId?: string,
  ) {
    const sessionDate = new Date(date);
    return this.service.generateSessionsFromTimetable(sessionDate, branchId);
  }

  @Post(':id/generate-dummy-data')
  @ApiOperation({
    summary: 'Generate dummy attendance data for a session',
    description: 'Generates realistic attendance records for all students in the session'
  })
  @ApiParam({ name: 'id', description: 'Session ID' })
  async generateDummyAttendanceData(
    @Param('id') sessionId: string,
    @Body('presentPercentage') presentPercentage: number = 85,
  ) {
    return this.service.generateDummyAttendanceData(sessionId, presentPercentage);
  }
}