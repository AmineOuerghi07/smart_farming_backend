import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateCustomerDto {

    _id : Types.ObjectId

    @IsString()
    @IsNotEmpty()
    name: string; // Fixed typo: "customerName" → "customerName"

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    phone: string;
}
