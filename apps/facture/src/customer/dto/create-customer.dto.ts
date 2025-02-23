import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateCustomerDto {
    @IsString()
    @IsNotEmpty()
    customerName: string; // Fixed typo: "costumerName" → "customerName"

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    phone: string;
}
