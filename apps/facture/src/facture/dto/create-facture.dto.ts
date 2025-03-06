import { IsString, IsNumber, IsOptional, IsDate } from 'class-validator';
import { ObjectId } from 'mongoose';

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

    
  @IsString()
  userId: ObjectId;
}

