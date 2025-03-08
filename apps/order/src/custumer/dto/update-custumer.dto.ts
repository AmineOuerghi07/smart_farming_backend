import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create-custumer.dto';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
}
