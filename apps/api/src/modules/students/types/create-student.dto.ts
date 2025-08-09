import { IsArray, IsIn, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateGuardianDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relation?: string;

  @ApiProperty()
  @IsString()
  @Length(1, 200)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;
}

export class CreateEnrollmentDto {
  @ApiProperty()
  @IsString()
  @Length(1, 100)
  sectionId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class CreateStudentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  admissionNo?: string;

  @ApiProperty()
  @IsString()
  @Length(1, 100)
  firstName!: string;

  @ApiProperty()
  @IsString()
  @Length(1, 100)
  lastName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dob?: string;

  @ApiPropertyOptional({ enum: ['male', 'female', 'other'] })
  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  className?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sectionName?: string;

  @ApiPropertyOptional({ type: [CreateGuardianDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGuardianDto)
  guardians?: CreateGuardianDto[];

  @ApiPropertyOptional({ type: CreateEnrollmentDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateEnrollmentDto)
  enrollment?: CreateEnrollmentDto;
}
