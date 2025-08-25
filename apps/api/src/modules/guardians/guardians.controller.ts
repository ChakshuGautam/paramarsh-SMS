import { DEFAULT_BRANCH_ID } from '../../common/constants';
import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GuardiansService } from './guardians.service';
import { CreateDocs, DeleteDocs, ListDocs, UpdateDocs } from '../../common/swagger.decorators';
import { IsOptional, IsString, IsUUID, IsEmail } from 'class-validator';

class CreateStandaloneGuardianDto {
  @ApiProperty({
    description: 'Unique identifier of the student this guardian is associated with',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @IsString()
  @IsUUID()
  studentId!: string;

  @ApiPropertyOptional({
    description: 'Relationship of the guardian to the student',
    example: 'father',
    enum: ['father', 'mother', 'grandfather', 'grandmother', 'uncle', 'aunt', 'sibling', 'guardian', 'other']
  })
  @IsOptional()
  @IsString()
  relation?: string;

  @ApiProperty({
    description: 'Full name of the guardian',
    example: 'John Smith',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    description: 'Email address of the guardian',
    example: 'john.smith@example.com',
    format: 'email'
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the guardian',
    example: '+1-234-567-8900',
    maxLength: 20
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Physical address of the guardian',
    example: '123 Main Street, City, State 12345',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  address?: string;
}

@ApiTags('Guardians')
@Controller('guardians')
export class GuardiansController {
  constructor(private readonly service: GuardiansService) {}

  @Get()
  @ListDocs('List guardians')
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'perPage', required: false, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'sort', required: false, description: 'Sort field and direction', example: 'name:asc' })
  @ApiQuery({ name: 'relation', required: false, description: 'Filter by relation', enum: ['father', 'mother', 'grandfather', 'grandmother', 'uncle', 'aunt', 'sibling', 'guardian', 'other'] })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  list(
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('pageSize') pageSize?: number, // Keep for backward compatibility
    @Query('sort') sort?: string,
    @Query('relation') relation?: string,
    @Query('q') q?: string,
    @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID,
  ) {
    // Use perPage if provided, fallback to pageSize for backward compatibility
    const effectivePerPage = perPage || pageSize;
    return this.service.list({ page, perPage: effectivePerPage, sort, relation, q, branchId });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID) {
    return this.service.findOne(id, branchId);
  }

  @Post()
  @CreateDocs('Create guardian')
  create(@Body() body: CreateStandaloneGuardianDto, @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID) {
    return this.service.create({ ...body, branchId });
  }

  @Patch(':id')
  @UpdateDocs('Update guardian')
  update(@Param('id') id: string, @Body() body: Partial<CreateStandaloneGuardianDto>, @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID) {
    return this.service.update(id, { ...body, branchId });
  }

  @Delete(':id')
  @DeleteDocs('Delete guardian')
  remove(@Param('id') id: string, @Headers('x-branch-id') branchId = DEFAULT_BRANCH_ID) {
    return this.service.remove(id, branchId);
  }
}
