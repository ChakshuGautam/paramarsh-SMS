import { IsArray, IsIn, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateGuardianDto {
  @ApiPropertyOptional({
    description: 'Relationship of the guardian to the student',
    example: 'father',
    enum: ['father', 'mother', 'grandfather', 'grandmother', 'uncle', 'aunt', 'sibling', 'guardian', 'other']
  })
  @IsOptional()
  @IsString()
  relation?: string;

  @ApiProperty({
    description: 'Full name of the guardian',
    example: 'John Smith',
    minLength: 1,
    maxLength: 200
  })
  @IsString()
  @Length(1, 200)
  name!: string;

  @ApiPropertyOptional({
    description: 'Email address of the guardian',
    example: 'john.smith@example.com',
    format: 'email'
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the guardian',
    example: '+1-234-567-8900',
    maxLength: 20
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Physical address of the guardian',
    example: '123 Main Street, City, State 12345',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  address?: string;
}

export class CreateEnrollmentDto {
  @ApiProperty({
    description: 'Unique identifier of the section the student is enrolling in',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  @Length(1, 100)
  sectionId!: string;

  @ApiPropertyOptional({
    description: 'Status of the enrollment',
    example: 'active',
    enum: ['active', 'inactive', 'transferred', 'graduated', 'dropped']
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Start date of the enrollment in ISO date format',
    example: '2024-08-01',
    format: 'date'
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date of the enrollment in ISO date format',
    example: '2025-05-31',
    format: 'date'
  })
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
