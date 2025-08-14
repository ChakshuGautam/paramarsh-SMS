import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, IsUUID, Length } from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({ 
    description: 'Type of entity that owns this ticket', 
    example: 'student',
    enum: ['student', 'guardian', 'staff']
  })
  @IsString()
  @IsIn(['student', 'guardian', 'staff'])
  ownerType!: string;

  @ApiProperty({ 
    description: 'ID of the entity that owns this ticket', 
    example: 'student-123',
    format: 'uuid'
  })
  @IsString()
  @IsUUID()
  ownerId!: string;

  @ApiProperty({ 
    description: 'Subject/title of the ticket', 
    example: 'Unable to access student portal',
    minLength: 1,
    maxLength: 200
  })
  @IsString()
  @Length(1, 200)
  subject!: string;

  @ApiProperty({ 
    description: 'Detailed description of the issue or request', 
    example: 'I am unable to log into the student portal using my credentials. I have tried resetting my password but still cannot access my account.'
  })
  @IsString()
  @Length(1, 2000)
  description!: string;

  @ApiPropertyOptional({ 
    description: 'Category of the ticket', 
    example: 'technical',
    enum: ['academic', 'fees', 'technical', 'general']
  })
  @IsOptional()
  @IsString()
  @IsIn(['academic', 'fees', 'technical', 'general'])
  category?: string;

  @ApiPropertyOptional({ 
    description: 'Priority level of the ticket', 
    example: 'normal',
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  })
  @IsOptional()
  @IsString()
  @IsIn(['low', 'normal', 'high', 'urgent'])
  priority?: string;

  @ApiPropertyOptional({ 
    description: 'ID of the staff member assigned to handle this ticket', 
    example: 'staff-456',
    format: 'uuid'
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  assigneeId?: string;
}