import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { GuardiansService } from './guardians.service';
import { CreateDocs, DeleteDocs, ListDocs, UpdateDocs } from '../../common/swagger.decorators';
import { IsOptional, IsString } from 'class-validator';

class CreateGuardianDto {
  @IsString()
  studentId!: string;
  @IsOptional()
  @IsString()
  relation?: string;
  @IsString()
  name!: string;
  @IsOptional()
  @IsString()
  email?: string;
  @IsOptional()
  @IsString()
  phone?: string;
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
  @ApiQuery({ name: 'studentId', required: false })
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.service.list({ page, pageSize, sort, studentId });
  }

  @Post()
  @CreateDocs('Create guardian')
  create(@Body() body: CreateGuardianDto) {
    return this.service.create(body);
  }

  @Patch(':id')
  @UpdateDocs('Update guardian')
  update(@Param('id') id: string, @Body() body: Partial<CreateGuardianDto>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @DeleteDocs('Delete guardian')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
