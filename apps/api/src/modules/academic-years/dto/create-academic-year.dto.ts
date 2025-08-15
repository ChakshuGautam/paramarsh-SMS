import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class TermDto {
  @IsString()
  name: string;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;
}

export class CreateAcademicYearDto {
  @IsString()
  name: string;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TermDto)
  terms?: TermDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}