import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsUUID, IsIn, IsArray, Length, ValidateIf, registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

// Custom validator to check if scheduled date is in the future
function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isFutureDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as CreateCampaignDto;
          // Only validate if status is 'scheduled' and schedule is provided
          if (obj.status === 'scheduled' && value) {
            const scheduleDate = new Date(value);
            const now = new Date();
            return scheduleDate > now;
          }
          return true; // Don't validate if not scheduled or no date provided
        },
        defaultMessage(args: ValidationArguments) {
          return 'Schedule date must be in the future for scheduled campaigns';
        },
      },
    });
  };
}

export class CreateCampaignDto {
  @ApiProperty({ 
    description: 'Campaign name', 
    example: 'Monthly Fee Reminder',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  @Length(1, 100)
  name!: string;

  @ApiPropertyOptional({ 
    description: 'Campaign description', 
    example: 'Automated monthly fee payment reminders for all students'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Template ID to use for the campaign', 
    example: 'template-123',
    format: 'uuid'
  })
  @IsString()
  @IsUUID()
  templateId!: string;

  @ApiProperty({ 
    description: 'Campaign status', 
    example: 'draft',
    enum: ['draft', 'scheduled', 'running', 'completed', 'paused', 'cancelled']
  })
  @IsString()
  @IsIn(['draft', 'scheduled', 'running', 'completed', 'paused', 'cancelled'])
  status!: string;

  @ApiPropertyOptional({ 
    description: 'Scheduled execution time', 
    example: '2024-01-15T10:00:00Z',
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString()
  @IsFutureDate()
  schedule?: string;

  @ApiPropertyOptional({ 
    description: 'JSON array of target audience criteria', 
    example: '{"class": "10", "section": "A"}'
  })
  @IsOptional()
  @IsString()
  audience?: string;

  @ApiPropertyOptional({ 
    description: 'JSON object with campaign variables', 
    example: '{"due_date": "2024-01-31", "grace_period": "7 days"}'
  })
  @IsOptional()
  @IsString()
  variables?: string;
}