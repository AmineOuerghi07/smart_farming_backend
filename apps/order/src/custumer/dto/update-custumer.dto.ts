import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create-custumer.dto';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  customerId: string;


  @IsOptional()
  @IsString()
  @IsNotEmpty()
  customerName: string; // Fixed typo: "customerName" → "customerName"

  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phone: string;
}
