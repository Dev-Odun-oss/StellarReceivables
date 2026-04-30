import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateInvoiceDto) {
    return this.prisma.invoice.create({
      data: { ...dto, dueDate: new Date(dto.dueDate) },
    });
  }

  findAll(farmer?: string) {
    return this.prisma.invoice.findMany({
      where: farmer ? { farmer } : undefined,
      include: { financings: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const inv = await this.prisma.invoice.findUnique({
      where: { id },
      include: { financings: true },
    });
    if (!inv) throw new NotFoundException('Invoice not found');
    return inv;
  }

  async updateOnChainId(id: string, onChainId: bigint) {
    return this.prisma.invoice.update({ where: { id }, data: { onChainId } });
  }

  async updateStatus(id: string, status: string, actualYield?: number) {
    return this.prisma.invoice.update({
      where: { id },
      data: { status, ...(actualYield !== undefined ? { actualYield } : {}) },
    });
  }
}
