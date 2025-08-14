import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
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
@Controller('fees/payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get()
  @ListDocs('List payments')
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'method', required: false })
  @ApiQuery({ name: 'invoiceId', required: false })
  list(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sort') sort?: string,
    @Query('status') status?: string,
    @Query('method') method?: string,
    @Query('invoiceId') invoiceId?: string,
  ) {
    return this.service.list({ page, pageSize, sort, status, method, invoiceId });
  }

  @Post()
  @CreateDocs('Create payment')
  create(@Body() body: UpsertPaymentDto) {
    return this.service.create(body);
  }

  @Patch(':id')
  @UpdateDocs('Update payment')
  update(@Param('id') id: string, @Body() body: Partial<UpsertPaymentDto>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @DeleteDocs('Delete payment')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
