import { IsNotEmpty, IsString, IsArray, ValidateNested, IsNumber, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
    @IsNotEmpty()
    @IsString()
    productId: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    quantity: number;
}

export class CreateOrderDto {
    @IsNotEmpty()
    @IsString()
    customerId: string; // Use string instead of ObjectId in DTOs

    @IsNotEmpty()
    @IsString()
    orderStatus: string; // You can add enum validation if needed
    @IsNotEmpty()
    @IsString()
    referenceId: string; 

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)  // ✅ Ensures correct transformation
    orderItems: OrderItemDto[];

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    totalAmount: number;
}
