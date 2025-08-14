import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsIn, IsUUID } from 'class-validator';

export class CreatePreferenceDto {
  @ApiProperty({ 
    description: 'Type of entity that owns this preference', 
    example: 'student',
    enum: ['student', 'guardian', 'staff']
  })
  @IsString()
  @IsIn(['student', 'guardian', 'staff'])
  ownerType!: string;

  @ApiProperty({ 
    description: 'ID of the entity that owns this preference', 
    example: 'student-123',
    format: 'uuid'
  })
  @IsString()
  @IsUUID()
  ownerId!: string;

  @ApiProperty({ 
    description: 'Communication channel for this preference', 
    example: 'sms',
    enum: ['sms', 'email', 'push', 'whatsapp']
  })
  @IsString()
  @IsIn(['sms', 'email', 'push', 'whatsapp'])
  channel!: string;

  @ApiPropertyOptional({ 
    description: 'Whether the user has given consent for this channel', 
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  consent?: boolean;

  @ApiPropertyOptional({ 
    description: 'Quiet hours configuration as JSON string with start and end times', 
    example: '{"start": "22:00", "end": "08:00"}',
    type: 'string'
  })
  @IsOptional()
  @IsString()
  quietHours?: string;
}