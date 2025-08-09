import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { IsNumber, IsOptional, IsString } from 'class-validator';

class UpsertPaymentDto {
  @IsString()
  invoiceId!: string;
  @IsOptional()
  @IsNumber()
  amount?: number;
  @IsOptional()
  @IsString()
  status?: string;
  @IsOptional()
  @IsString()
  method?: string;
  @IsOptional()
  @IsString()
  gateway?: string;
  @IsOptional()
  @IsString()
  reference?: string;
}

@ApiTags('Payments')
@Controller('fees/payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Get()
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
  create(@Body() body: UpsertPaymentDto) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<UpsertPaymentDto>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
