import { DEFAULT_BRANCH_ID } from '../../common/constants';
import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreateDocs, DeleteDocs, ListDocs, UpdateDocs } from '../../common/swagger.decorators';
import { IsNumber, IsOptional, IsString, IsUUID, IsPositive } from 'class-validator';

class UpsertPaymentDto {
  @ApiProperty({
    description: 'Unique identifier of the invoice this payment is for',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @IsString()
  @IsUUID()
  invoiceId!: string;

  @ApiPropertyOptional({
    description: 'Payment amount in the smallest currency unit (e.g., cents)',
    example: 150000,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiPropertyOptional({
    description: 'Current status of the payment',
    example: 'completed',
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded']
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Payment method used',
    example: 'credit_card',
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'upi', 'wallet', 'cheque']
  })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({
    description: 'Payment gateway used for processing',
    example: 'stripe',
    enum: ['stripe', 'razorpay', 'paypal', 'manual']
  })
  @IsOptional()
  @IsString()
  gateway?: string;

  @ApiPropertyOptional({
    description: 'External reference number or transaction ID',
    example: 'TXN123456789',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  reference?: string;
}

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get()
  @ListDocs('List payments')
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (starts from 1)' })
  @ApiQuery({ name: 'perPage', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Number of items per page (alias for perPage)' })
  @ApiQuery({ name: 'sort', required: false, type: String, description: 'Sort field and direction' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'method', required: false })
  @ApiQuery({ name: 'invoiceId', required: false })
  @ApiQuery({ name: 'q', required: false, description: 'Search query for reference, gateway, method' })
  list(
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('status') status?: string,
    @Query('method') method?: string,
    @Query('invoiceId') invoiceId?: string,
    @Query('q') q?: string,
    @Query('filter') filterStr?: string,
    @Query('ids') ids?: string,
    @Headers('x-branch-id') branchId: string = DEFAULT_BRANCH_ID,
  ) {
    const filter = filterStr ? JSON.parse(filterStr) : undefined;
    
    if (ids) {
      const idList = ids.split(',');
      return this.service.list({ branchId }).then(response => ({
        data: response.data.filter(item => idList.includes(item.id))
      }));
    }
    
    const effectivePerPage = perPage || pageSize;
    return this.service.list({ page, perPage: effectivePerPage, sort, status, method, invoiceId, q, filter, branchId });
  }

  @Get(':id')
  @ApiTags('Payments')
  getOne(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId: string = DEFAULT_BRANCH_ID,
  ) {
    return this.service.getOne(id, branchId);
  }

  @Post()
  @CreateDocs('Create payment')
  create(
    @Body() body: UpsertPaymentDto,
    @Headers('x-branch-id') branchId: string = DEFAULT_BRANCH_ID,
  ) {
    return this.service.create({ ...body, branchId });
  }

  @Patch(':id')
  @UpdateDocs('Update payment')
  update(
    @Param('id') id: string,
    @Body() body: Partial<UpsertPaymentDto>,
    @Headers('x-branch-id') branchId: string = DEFAULT_BRANCH_ID,
  ) {
    return this.service.update(id, body, branchId);
  }

  @Put(':id')
  @UpdateDocs('Update payment (PUT)')
  updateFull(
    @Param('id') id: string,
    @Body() body: Partial<UpsertPaymentDto>,
    @Headers('x-branch-id') branchId: string = DEFAULT_BRANCH_ID,
  ) {
    return this.service.update(id, body, branchId);
  }

  @Delete(':id')
  @DeleteDocs('Delete payment')
  remove(
    @Param('id') id: string,
    @Headers('x-branch-id') branchId: string = DEFAULT_BRANCH_ID,
  ) {
    return this.service.remove(id, branchId);
  }
}
