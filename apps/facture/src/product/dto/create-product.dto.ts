import { IsString, IsNumber, IsOptional, Min, Length } from "class-validator";

export class CreateProductDto {

    @IsString()
    @Length(3, 50)
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsNumber()
    @Min(0)
    quantity: number;

    @IsNumber()
    @Min(0)
    stockQuantity: number;
}
