import { IsNotEmpty, IsObject, IsArray, ArrayNotEmpty, Matches, ValidateNested, IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class WorkingHours {
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Working hours start time must be in HH:MM format',
  })
  start: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Working hours end time must be in HH:MM format',
  })
  end: string;
}

export class TimetableConfigDto {
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => WorkingHours)
  workingHours: WorkingHours;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty({ message: 'Working days array cannot be empty' })
  workingDays: string[];

  @IsOptional()
  @IsNumber()
  periodsPerDay?: number;

  @IsOptional()
  @IsNumber()
  periodDuration?: number;
}
