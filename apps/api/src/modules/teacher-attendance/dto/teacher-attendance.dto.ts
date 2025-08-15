import { IsString, IsNotEmpty, IsOptional, IsDate, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckInDto {
  @IsString()
  @IsNotEmpty()
  teacherId: string;
}

export class CheckOutDto {
  @IsString()
  @IsNotEmpty()
  teacherId: string;
}

export class AttendanceRecordDto {
  @IsString()
  @IsNotEmpty()
  teacherId: string;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsEnum(['present', 'absent', 'late', 'half-day'])
  status: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  checkIn?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  checkOut?: Date;
}

export class BulkAttendanceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  records: AttendanceRecordDto[];
}