import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateSensorDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  region: Types.ObjectId;  
}
