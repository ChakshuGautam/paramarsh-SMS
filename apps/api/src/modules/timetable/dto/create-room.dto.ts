import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, Length, Min, IsIn } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ 
    description: 'Unique room code/identifier', 
    example: 'A101',
    minLength: 1,
    maxLength: 20
  })
  @IsString()
  @Length(1, 20)
  code!: string;

  @ApiProperty({ 
    description: 'Room name', 
    example: 'Science Laboratory A',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  @Length(1, 100)
  name!: string;

  @ApiPropertyOptional({ 
    description: 'Building name', 
    example: 'Academic Block A'
  })
  @IsOptional()
  @IsString()
  building?: string;

  @ApiPropertyOptional({ 
    description: 'Floor level', 
    example: 'Ground Floor'
  })
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiProperty({ 
    description: 'Room capacity (number of students)', 
    example: 40,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  capacity!: number;

  @ApiProperty({ 
    description: 'Type of room', 
    example: 'classroom',
    enum: ['classroom', 'lab', 'auditorium', 'sports']
  })
  @IsString()
  @IsIn(['classroom', 'lab', 'auditorium', 'sports'])
  type!: string;

  @ApiPropertyOptional({ 
    description: 'JSON array of available facilities', 
    example: '["projector", "whiteboard", "AC", "computers"]'
  })
  @IsOptional()
  @IsString()
  facilities?: string;

  @ApiPropertyOptional({ 
    description: 'Whether the room is active/available', 
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}