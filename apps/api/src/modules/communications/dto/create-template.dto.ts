import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsIn, Length } from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty({ 
    description: 'Template name', 
    example: 'Fee Reminder',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  @Length(1, 100)
  name!: string;

  @ApiProperty({ 
    description: 'Template content with placeholders', 
    example: 'Dear {{parent_name}}, your fee of {{amount}} is due on {{due_date}}.'
  })
  @IsString()
  content!: string;

  @ApiProperty({ 
    description: 'Communication channel', 
    example: 'sms',
    enum: ['sms', 'email', 'push', 'whatsapp']
  })
  @IsString()
  @IsIn(['sms', 'email', 'push', 'whatsapp'])
  channel!: string;

  @ApiPropertyOptional({ 
    description: 'Template subject (for email/push)', 
    example: 'Fee Payment Reminder'
  })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ 
    description: 'Template category', 
    example: 'fees'
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ 
    description: 'Template variables as JSON array', 
    example: '["parent_name", "amount", "due_date"]'
  })
  @IsOptional()
  @IsString()
  variables?: string;

  @ApiPropertyOptional({ 
    description: 'Whether the template is active', 
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}