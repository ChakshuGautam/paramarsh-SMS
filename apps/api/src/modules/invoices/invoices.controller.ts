import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateDocs, DeleteDocs, ListDocs, UpdateDocs } from '../../common/swagger.decorators';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { FilesService } from '../files/files.service';

class UpsertInvoiceDto {
  @IsString()
  studentId!: string;
  @IsOptional()
  @IsString()
  period?: string;
  @IsOptional()
  @IsString()
  dueDate?: string;
  @IsOptional()
  @IsNumber()
  amount?: number;
  @IsOptional()
  @IsString()
  status?: string;
  @IsOptional()
  @IsBoolean()
  withPayment?: boolean;
}

@ApiTags('Invoices')
@Controller('fees/invoices')
export class InvoicesController {
  constructor(private readonly service: InvoicesService, private readonly files: FilesService) {}

  @Get()
  @ListDocs('List invoices')
  @ApiQuery({ name: 'studentId', required: false })
  @ApiQuery({ name: 'status', required: false })
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('studentId') studentId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.list({ page, pageSize, sort, studentId, status });
  }

  @Post()
  @CreateDocs('Create invoice')
  create(@Body() body: UpsertInvoiceDto) {
    return this.service.create(body);
  }

  @Patch(':id')
  @UpdateDocs('Update invoice')
  update(@Param('id') id: string, @Body() body: Partial<UpsertInvoiceDto>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @DeleteDocs('Delete invoice')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/export')
  async export(@Param('id') id: string) {
    const { key } = await this.service.exportPdfAndUpload(id);
    return { data: { key } };
  }
}
