import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsArray, 
  IsString, 
  IsOptional, 
  IsNumber, 
  ValidateNested,
  IsEnum,
  Min
} from 'class-validator';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
  MEDICAL = 'medical',
  SUSPENDED = 'suspended',
  ACTIVITY = 'activity'
}

export class StudentAttendanceMarkDto {
  @ApiProperty({
    description: 'Student ID',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsString()
  studentId: string;

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
}

export class MarkAttendanceDto {
  @ApiProperty({
    description: 'Array of student attendance markings',
    type: [StudentAttendanceMarkDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentAttendanceMarkDto)
  markings: StudentAttendanceMarkDto[];

  @ApiPropertyOptional({
    description: 'Teacher ID (if not from auth)',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  @IsOptional()
  @IsString()
  teacherId?: string;
}