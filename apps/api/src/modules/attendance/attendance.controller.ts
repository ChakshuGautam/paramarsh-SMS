import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { IsOptional, IsString } from 'class-validator';

class UpsertAttendanceDto {
  @IsString()
  studentId!: string;
  @IsString()
  date!: string;
  @IsOptional()
  @IsString()
  status?: string;
  @IsOptional()
  @IsString()
  reason?: string;
  @IsOptional()
  @IsString()
  markedBy?: string;
  @IsOptional()
  @IsString()
  source?: string;
}

@ApiTags('Attendance')
@Controller('attendance/records')
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Get()
  @ApiQuery({ name: 'studentId', required: false })
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.service.list({ page, pageSize, sort, studentId });
  }

  @Post()
  create(@Body() body: UpsertAttendanceDto) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<UpsertAttendanceDto>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
