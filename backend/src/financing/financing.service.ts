import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvoicesService } from '../invoices/invoices.service';
import { CreateFinancingDto } from './dto/create-financing.dto';

@Injectable()
export class FinancingService {
  constructor(
    private prisma: PrismaService,
    private invoices: InvoicesService,
  ) {}

  async create(dto: CreateFinancingDto) {
    const invoice = await this.invoices.findOne(dto.invoiceId);
    if (invoice.status !== 'PENDING') throw new Error('Invoice not available');

    const financing = await this.prisma.financing.create({ data: dto });
    await this.invoices.updateStatus(dto.invoiceId, 'FINANCED');
    return financing;
  }

  findByLender(lender: string) {
    return this.prisma.financing.findMany({
      where: { lender },
      include: { invoice: true },
      orderBy: { fundedAt: 'desc' },
    });
  }
}
