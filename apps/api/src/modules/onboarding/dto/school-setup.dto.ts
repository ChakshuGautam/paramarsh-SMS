import { IsString, IsOptional, IsNotEmpty, MaxLength, Matches } from 'class-validator';

export class SchoolSetupDto {
  @IsNotEmpty({ message: 'School name is required' })
  @IsString()
  @MaxLength(500, { message: 'School name must not exceed 500 characters' })
  schoolName: string;

  @IsNotEmpty({ message: 'School type is required' })
  @IsString()
  schoolType: string;

  @IsNotEmpty({ message: 'Location is required' })
  @IsString()
  location: string;

  @IsNotEmpty({ message: 'Academic year is required' })
  @IsString()
  @Matches(/^\d{4}[-/](\d{2}|\d{4})$/, {
    message: 'Academic year must be in format YYYY-YY or YYYY-YYYY',
  })
  academicYear: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  brandColor?: string;
}
