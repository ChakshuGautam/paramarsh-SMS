import { DEFAULT_BRANCH_ID } from '../../common/constants';
import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
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
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly service: InvoicesService) {}

  @Get()
  @ListDocs('List invoices')
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (starts from 1)' })
  @ApiQuery({ name: 'perPage', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of items per page (alias for perPage)' })
  @ApiQuery({ name: 'sort', required: false, type: String, description: 'Sort field and direction' })
  @ApiQuery({ name: 'studentId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'q', required: false, description: 'Search query for period, status, and student details' })
  list(
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('studentId') studentId?: string,
    @Query('status') status?: string,
    @Query('q') q?: string,
    @Query('filter') filterStr?: string,
    @Query('ids') ids?: string,
    @Headers('x-branch-id') branchId: string = DEFAULT_BRANCH_ID,
  ) {
    const filter = filterStr ? JSON.parse(filterStr) : undefined;
    
    if (ids) {
      const idList = ids.split(',');
      return this.service.list({ branchId, ids: ids }).then(response => ({
        data: response.data.filter(item => idList.includes(item.id))
      }));
    }
    
    const effectivePerPage = perPage || pageSize;
    return this.service.list({ page, perPage: effectivePerPage, sort, studentId, status, q, filter, branchId });
  }

  @Get(':id')
  @ApiTags('Invoices')
  getOne(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId: string = DEFAULT_BRANCH_ID,
  ) {
    return this.service.getOneWithBranch(id, branchId);
  }

  @Post()
  @CreateDocs('Create invoice')
  create(
    @Body() body: UpsertInvoiceDto,
    @Headers('x-branch-id') branchId: string = DEFAULT_BRANCH_ID,
  ) {
    return this.service.create({ ...body, branchId });
  }

  @Patch(':id')
  @UpdateDocs('Update invoice')
  update(
    @Param('id') id: string,
    @Body() body: Partial<UpsertInvoiceDto>,
    @Headers('x-branch-id') branchId: string = DEFAULT_BRANCH_ID,
  ) {
    return this.service.updateWithBranch(id, body, branchId);
  }

  @Delete(':id')
  @DeleteDocs('Delete invoice')
  remove(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId: string = DEFAULT_BRANCH_ID,
  ) {
    return this.service.remove(id, branchId);
  }

  @Post(':id/export')
  async export(@Param('id') id: string) {
    const { key } = await this.service.exportPdfAndUpload(id);
    return { data: { key } };
  }

  // Invoice generation and sharing endpoints
  @Post(':id/generate')
  generateInvoice(@Param('id') invoiceId: string) {
    return this.service.generateInvoice(invoiceId);
  }

  @Post(':id/share')
  shareInvoice(
    @Param('id') invoiceId: string,
    @Body() body: { method: 'email' | 'sms' | 'both'; recipients?: string[] }
  ) {
    return this.service.shareInvoice(invoiceId, body.method, body.recipients);
  }

  @Post('bulk/generate')
  generateBulkInvoices(
    @Body() body: { classId?: string; sectionId?: string; period?: string; dueDate?: string }
  ) {
    return this.service.generateBulkInvoices(body.classId, body.sectionId, body.period, body.dueDate);
  }

  @Post('reminders/send')
  sendPaymentReminders(
    @Body() body: { method: 'email' | 'sms' | 'both' }
  ) {
    return this.service.sendPaymentReminders(body.method);
  }
}
