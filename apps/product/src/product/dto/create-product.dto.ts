import { IsNotEmpty, IsOptional, IsNumber, IsString, Min } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;


    @IsNotEmpty()
    category: string;
    

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    quantity?: number;



    @IsNumber()
    @Min(0)
    stockQuantity: number;
    @IsString()
  @IsOptional()
  image?: string;
}
