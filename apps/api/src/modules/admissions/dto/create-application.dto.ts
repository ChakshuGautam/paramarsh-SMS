import { IsString, IsEmail, IsOptional, IsIn, IsNotEmpty, Matches } from 'class-validator';

export class CreateApplicationDto {
  @IsOptional()
  @IsString()
  @Matches(/^APP\d{8}$/, { message: 'Application number must be in format APP20250001' })
  applicationNo?: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format' })
  dob: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(['male', 'female', 'other'])
  gender: string;

  @IsNotEmpty()
  @IsString()
  guardianName: string;

  @IsNotEmpty()
  @IsString()
  guardianPhone: string;

  @IsOptional()
  @IsEmail()
  guardianEmail?: string;

  @IsOptional()
  @IsString()
  previousSchool?: string;

  @IsNotEmpty()
  @IsString()
  classAppliedFor: string;

  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED'])
  status?: string;

  @IsOptional()
  @IsString()
  reviewedBy?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}