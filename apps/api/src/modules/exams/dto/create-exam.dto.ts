import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean, Min, Max } from 'class-validator';
import { ExamType, ExamStatus } from '../exam-types.enum';

export class CreateExamDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(ExamType)
  examType?: ExamType;

  @IsOptional()
  @IsString()
  academicYearId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  term?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  weightagePercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPassingMarks?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxMarks?: number;

  @IsOptional()
  @IsEnum(ExamStatus)
  status?: ExamStatus;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}