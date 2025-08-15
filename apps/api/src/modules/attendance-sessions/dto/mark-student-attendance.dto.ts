import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { AttendanceStatus } from './mark-attendance.dto';

export class MarkStudentAttendanceDto {
  @ApiProperty({
    description: 'Attendance status',
    enum: AttendanceStatus,
    example: AttendanceStatus.PRESENT
  })
  @IsEnum(AttendanceStatus)
  status: string;

  @ApiPropertyOptional({
    description: 'Minutes late (for late status)',
    example: 5,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minutesLate?: number;

  @ApiPropertyOptional({
    description: 'Reason for absence or late arrival',
    example: 'Medical appointment'
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Parent called to inform'
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Teacher ID (if not from auth)',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  @IsOptional()
  @IsString()
  teacherId?: string;
}