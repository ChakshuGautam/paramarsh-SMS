import { IsDateString, IsIn, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttendanceDto {
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
    enum: ['present', 'absent', 'late', 'excused', 'sick', 'partial'],
    default: 'present'
  })
  @IsOptional()
  @IsString()
  @IsIn(['present', 'absent', 'late', 'excused', 'sick', 'partial'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Reason for absence or late arrival',
    example: 'Doctor appointment',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  reason?: string;

  @ApiPropertyOptional({
    description: 'Identifier of the person who marked the attendance',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid'
  })
  @IsOptional()
  @IsString()
  markedBy?: string;

  @ApiPropertyOptional({
    description: 'Source system or method used to record attendance',
    example: 'manual',
    enum: ['manual', 'biometric', 'rfid', 'mobile_app', 'web_portal', 'import'],
    default: 'manual'
  })
  @IsOptional()
  @IsString()
  @IsIn(['manual', 'biometric', 'rfid', 'mobile_app', 'web_portal', 'import'])
  source?: string;
}