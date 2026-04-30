import { IsString, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFinancingDto {
  @ApiProperty() @IsString() invoiceId: string;
  @ApiProperty() @IsString() lender: string;
  @ApiProperty() @IsNumber() @IsPositive() amount: number;
}
