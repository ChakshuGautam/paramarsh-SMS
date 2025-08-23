import { IsNotEmpty, IsString, IsInt, IsBoolean, IsOptional, Min, Max, Matches } from 'class-validator';

export class CreatePeriodDto {
  @IsNotEmpty()
  @IsString()
  sectionId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(6)
  dayOfWeek: number; // 1-6 for Monday-Saturday

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  periodNumber: number;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:MM format',
  })
  startTime: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:MM format',
  })
  endTime: string;

  @IsOptional()
  @IsString()
  subjectId?: string; // Optional for break periods

  @IsOptional()
  @IsString()
  teacherId?: string; // Optional for break periods

  @IsOptional()
  @IsString()
  roomId?: string;

  @IsOptional()
  @IsBoolean()
  isBreak?: boolean;

  @IsOptional()
  @IsString()
  breakType?: string; // SHORT/LUNCH (only for break periods)

  @IsNotEmpty()
  @IsString()
  academicYearId: string;
}