import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateTeacherAttendanceDto {
  @IsString()
  @IsNotEmpty()
  teacherId: string;

  @IsString()
  @IsNotEmpty()
  date: string; // Date in YYYY-MM-DD format

  @IsOptional()
  @IsString()
  checkIn?: string; // Time in HH:MM format

  @IsOptional()
  @IsString()
  checkOut?: string; // Time in HH:MM format

  @IsEnum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE'])
  status: string;

  @IsOptional()
  @IsEnum(['CASUAL', 'SICK', 'EARNED', 'UNPAID'])
  leaveType?: string; // Only required when status is ON_LEAVE

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateTeacherAttendanceDto extends PartialType(CreateTeacherAttendanceDto) {}