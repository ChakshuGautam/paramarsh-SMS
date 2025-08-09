import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { GuardiansService } from './guardians.service';
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

@Controller('guardians')
export class GuardiansController {
  constructor(private readonly service: GuardiansService) {}

  @Get()
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.service.list({ page, pageSize, sort, studentId });
  }

  @Post()
  create(@Body() body: CreateGuardianDto) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<CreateGuardianDto>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
