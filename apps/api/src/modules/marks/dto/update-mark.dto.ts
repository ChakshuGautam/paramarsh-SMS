import { IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';

export class UpdateMarkDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  theoryMarks?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  practicalMarks?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  projectMarks?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  internalMarks?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalMarks?: number;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsBoolean()
  isAbsent?: boolean;

  @IsOptional()
  @IsString()
  evaluatedBy?: string;
}