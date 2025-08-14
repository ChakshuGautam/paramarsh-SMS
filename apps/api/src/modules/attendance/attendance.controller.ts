import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateDocs, DeleteDocs, ListDocs, UpdateDocs } from '../../common/swagger.decorators';
import { IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';

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

@ApiTags('Attendance')
@Controller('attendance/records')
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Get()
  @ListDocs('List attendance records')
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
  @CreateDocs('Create attendance record')
  create(@Body() body: UpsertAttendanceDto) {
    return this.service.create(body);
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
}
