import { IsString, IsNumber, IsDateString, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvoiceDto {
  @ApiProperty() @IsString() farmer: string;
  @ApiProperty() @IsString() cropType: string;
  @ApiProperty() @IsNumber() @IsPositive() expectedYield: number;
  @ApiProperty() @IsNumber() @IsPositive() amountRequested: number;
  @ApiProperty() @IsDateString() dueDate: string;
}
