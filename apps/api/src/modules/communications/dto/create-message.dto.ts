import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsIn } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ 
    description: 'Communication channel', 
    example: 'sms',
    enum: ['sms', 'email', 'push', 'whatsapp']
  })
  @IsString()
  @IsIn(['sms', 'email', 'push', 'whatsapp'])
  channel!: string;

  @ApiProperty({ 
    description: 'Recipient identifier (phone, email, or user ID)', 
    example: '+1234567890'
  })
  @IsString()
  to!: string;

  @ApiPropertyOptional({ 
    description: 'Template ID to use for the message', 
    example: 'template-123',
    format: 'uuid'
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  templateId?: string;

  @ApiPropertyOptional({ 
    description: 'Campaign ID if part of a campaign', 
    example: 'campaign-456',
    format: 'uuid'
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  campaignId?: string;

  @ApiPropertyOptional({ 
    description: 'Template variables and message data', 
    example: { name: 'John Doe', amount: '5000', due_date: '2024-01-31' }
  })
  @IsOptional()
  payload?: any;
}