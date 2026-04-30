import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FinancingService } from './financing.service';
import { CreateFinancingDto } from './dto/create-financing.dto';

@ApiTags('financing')
@Controller('financing')
export class FinancingController {
  constructor(private readonly svc: FinancingService) {}

  @Post() create(@Body() dto: CreateFinancingDto) { return this.svc.create(dto); }
  @Get() findByLender(@Query('lender') lender: string) { return this.svc.findByLender(lender); }
}
