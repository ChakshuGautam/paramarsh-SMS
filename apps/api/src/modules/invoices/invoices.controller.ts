import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateDocs, DeleteDocs, ListDocs, UpdateDocs } from '../../common/swagger.decorators';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID, IsDateString, IsPositive } from 'class-validator';

class UpsertInvoiceDto {
  @ApiProperty({
    description: 'Unique identifier of the student this invoice belongs to',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @IsString()
  @IsUUID()
  studentId!: string;

  @ApiPropertyOptional({
    description: 'Billing period for the invoice (e.g., month-year or term)',
    example: '2024-03',
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiPropertyOptional({
    description: 'Due date for the invoice payment in ISO date format',
    example: '2024-03-15',
    format: 'date'
  })
  @IsOptional()
  @IsString()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Total amount due for the invoice in the smallest currency unit (e.g., cents)',
    example: 150000,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiPropertyOptional({
    description: 'Current status of the invoice',
    example: 'pending',
    enum: ['pending', 'paid', 'overdue', 'cancelled', 'partial']
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Whether to create a payment record along with the invoice',
    example: false
  })
  @IsOptional()
  @IsBoolean()
  withPayment?: boolean;
}

@ApiTags('Invoices')
@Controller('fees/invoices')
export class InvoicesController {
  constructor(private readonly service: InvoicesService) {}

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
