import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsMongoId } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsMongoId()
  id: string; // Ensuring `id` is a valid MongoDB ObjectId
}
