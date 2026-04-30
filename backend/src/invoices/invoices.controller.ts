import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly svc: InvoicesService) {}

  @Post() create(@Body() dto: CreateInvoiceDto) { return this.svc.create(dto); }
  @Get() findAll(@Query('farmer') farmer?: string) { return this.svc.findAll(farmer); }
  @Get(':id') findOne(@Param('id') id: string) { return this.svc.findOne(id); }
}
