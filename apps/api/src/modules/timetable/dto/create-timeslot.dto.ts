import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, Length, Min, Max, IsIn } from 'class-validator';

export class CreateTimeSlotDto {
  @ApiProperty({ 
    description: 'Day of the week (0=Sunday, 1=Monday, ... 6=Saturday)', 
    example: 1,
    enum: [0, 1, 2, 3, 4, 5, 6],
    minimum: 0,
    maximum: 6
  })
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @ApiProperty({ 
    description: 'Start time in HH:MM format', 
    example: '09:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
  })
  @IsString()
  startTime!: string;

  @ApiProperty({ 
    description: 'End time in HH:MM format', 
    example: '10:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
  })
  @IsString()
  endTime!: string;

  @ApiPropertyOptional({ 
    description: 'Name or label for this time slot', 
    example: 'Period 1'
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  name?: string;

  @ApiPropertyOptional({ 
    description: 'Duration in minutes', 
    example: 60,
    minimum: 1,
    maximum: 480
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(480)
  duration?: number;

  @ApiPropertyOptional({ 
    description: 'Whether this time slot is available for scheduling', 
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ 
    description: 'Order/sequence of this time slot in the day', 
    example: 1,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  slotOrder!: number;
}