import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query,
  HttpStatus,
  HttpCode,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { TeacherAttendanceService } from './teacher-attendance.service';
import { CheckInDto, CheckOutDto, BulkAttendanceDto } from './dto/teacher-attendance.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { BranchGuard } from '../../common/guards/branch.guard';
import { ApiOperation } from '@nestjs/swagger';

@Controller('teacher-attendance')
@UseGuards(JwtAuthGuard, BranchGuard)
export class TeacherAttendanceController {
  constructor(private readonly service: TeacherAttendanceService) {}

  @Get()
  async findAll(
    @Query('teacherId') teacherId?: string,
    @Query('date') date?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Headers('x-branch-id') branchId?: string,
  ) {
    const filter: any = { branchId };
    
    if (teacherId) filter.teacherId = teacherId;
    
    if (date) {
      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);
      const nextDay = new Date(dateObj);
      nextDay.setDate(nextDay.getDate() + 1);
      
      filter.date = {
        gte: dateObj,
        lt: nextDay,
      };
    } else if (startDate && endDate) {
      filter.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    
    const data = await this.service.findAll(filter);
    return { data };
  }

  @Get('today/:teacherId')
  async getTodayAttendance(
    @Param('teacherId') teacherId: string,
    @Headers('x-branch-id') branchId?: string,
  ) {
    const data = await this.service.getTodayAttendance(teacherId, branchId);
    return { data };
  }

  @Get('report/:teacherId')
  async getAttendanceReport(
    @Param('teacherId') teacherId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Headers('x-branch-id') branchId?: string,
  ) {
    const report = await this.service.getAttendanceReport(
      teacherId,
      new Date(startDate),
      new Date(endDate),
      branchId,
    );
    return { data: report };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ) {
    const data = await this.service.findOne(id);
    return { data };
  }

  @Post('check-in')
  @HttpCode(HttpStatus.OK)
  async checkIn(
    @Body() dto: CheckInDto,
    @Headers('x-branch-id') branchId?: string,
  ) {
    const data = await this.service.checkIn(dto, branchId);
    return { data, message: 'Checked in successfully' };
  }

  @Post('check-out')
  @HttpCode(HttpStatus.OK)
  async checkOut(
    @Body() dto: CheckOutDto,
    @Headers('x-branch-id') branchId?: string,
  ) {
    const data = await this.service.checkOut(dto, branchId);
    return { data, message: 'Checked out successfully' };
  }

  @Post('mark-absent/:teacherId')
  @HttpCode(HttpStatus.OK)
  async markAbsent(
    @Param('teacherId') teacherId: string,
    @Body('date') date: string,
    @Headers('x-branch-id') branchId?: string,
  ) {
    const data = await this.service.markAbsent(
      teacherId,
      new Date(date),
      branchId,
    );
    return { data, message: 'Marked as absent' };
  }

  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  async bulkMarkAttendance(
    @Body() dto: BulkAttendanceDto,
    @Headers('x-branch-id') branchId?: string,
  ) {
    const data = await this.service.bulkMarkAttendance(dto.records, branchId);
    return { 
      data, 
      message: `${data.length} attendance records updated` 
    };
  }

  @Post('generate-dummy')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate dummy teacher attendance data',
    description: 'Generates realistic attendance records for all active teachers for a given date'
  })
  async generateDummyAttendance(
    @Body('date') date: string,
    @Headers('x-branch-id') branchId?: string,
  ) {
    const attendanceDate = new Date(date);
    return this.service.generateDummyAttendance(attendanceDate, branchId);
  }
}