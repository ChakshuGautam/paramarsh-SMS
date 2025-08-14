import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateSubstitutionDto {
  @ApiProperty({ 
    description: 'ID of the original timetable period being substituted', 
    example: 'period-123',
    format: 'uuid'
  })
  @IsString()
  @IsUUID()
  originalPeriodId!: string;

  @ApiProperty({ 
    description: 'ID of the substitute teacher', 
    example: 'teacher-456',
    format: 'uuid'
  })
  @IsString()
  @IsUUID()
  substituteTeacherId!: string;

  @ApiProperty({ 
    description: 'Date of substitution in ISO format', 
    example: '2024-01-15',
    format: 'date'
  })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({ 
    description: 'Reason for the substitution', 
    example: 'Teacher on medical leave'
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ 
    description: 'Additional notes about the substitution', 
    example: 'Covers Chapter 5 exercises'
  })
  @IsOptional()
  @IsString()
  notes?: string;
}