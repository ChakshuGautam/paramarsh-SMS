import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, Length, Min } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ 
    description: 'Unique subject code', 
    example: 'MATH101',
    minLength: 1,
    maxLength: 20
  })
  @IsString()
  @Length(1, 20)
  code!: string;

  @ApiProperty({ 
    description: 'Subject name', 
    example: 'Mathematics - Algebra',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  @Length(1, 100)
  name!: string;

  @ApiPropertyOptional({ 
    description: 'Subject description', 
    example: 'Introduction to algebraic concepts and problem solving'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Credit hours for the subject', 
    example: 3,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  credits?: number;

  @ApiPropertyOptional({ 
    description: 'Whether this is an elective subject', 
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isElective?: boolean;

  @ApiPropertyOptional({ 
    description: 'JSON array of prerequisite subject IDs', 
    example: '["sub123", "sub456"]'
  })
  @IsOptional()
  @IsString()
  prerequisites?: string;
}