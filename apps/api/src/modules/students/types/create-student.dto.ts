import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export class CreateStudentDto {
  @IsOptional()
  @IsString()
  admissionNo?: string;

  @IsString()
  @Length(1, 100)
  firstName!: string;

  @IsString()
  @Length(1, 100)
  lastName!: string;

  @IsOptional()
  @IsString()
  dob?: string;

  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  gender?: string;

  @IsOptional()
  @IsString()
  className?: string;

  @IsOptional()
  @IsString()
  sectionName?: string;
}
