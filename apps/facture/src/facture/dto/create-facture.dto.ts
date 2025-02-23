import { IsString, IsNumber, IsOptional, IsDate } from 'class-validator';

export class CreateFactureDto {
    @IsOptional()
    @IsString()
    orderId: string;

    @IsOptional()
    @IsNumber()
    totalAmount: number;

    @IsOptional()
    @IsDate()
    issueDate?: Date;
}

