import { IsString, IsUUID, IsIn, IsOptional, IsInt, IsDateString, Min, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentPeriodAttendanceDto {
  @ApiProperty({
    description: 'Attendance session ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @IsString()
  @IsUUID()
  sessionId!: string;

  @ApiProperty({
    description: 'Student ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid'
  })
  @IsString()
  @IsUUID()
  studentId!: string;

  @ApiProperty({
    description: 'Attendance status',
    example: 'present',
    enum: ['present', 'absent', 'late', 'excused'],
    default: 'present'
  })
  @IsString()
  @IsIn(['present', 'absent', 'late', 'excused'])
  status!: string;

  @ApiPropertyOptional({
    description: 'Minutes late (if status is late)',
    example: 15,
    minimum: 0
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  minutesLate?: number;

  @ApiPropertyOptional({
    description: 'Reason for absence or lateness',
    example: 'Doctor appointment',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  reason?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Student brought medical certificate',
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Date and time when attendance was marked',
    example: '2024-01-15T09:30:00.000Z',
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString()
  markedAt?: string;

  @ApiProperty({
    description: 'ID of the teacher who marked the attendance',
    example: '550e8400-e29b-41d4-a716-446655440002',
    format: 'uuid'
  })
  @IsString()
  @IsUUID()
  markedBy!: string;
}