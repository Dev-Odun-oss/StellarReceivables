import { Module } from '@nestjs/common';
import { FinancingController } from './financing.controller';
import { FinancingService } from './financing.service';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [InvoicesModule],
  controllers: [FinancingController],
  providers: [FinancingService],
})
export class FinancingModule {}
