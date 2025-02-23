import { IsNotEmpty, IsString, IsArray } from 'class-validator';
import { Types } from 'mongoose';

export class CreateRegionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsArray()
  sensors: Types.ObjectId[];  
}
