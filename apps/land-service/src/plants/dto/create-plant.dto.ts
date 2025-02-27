import { IsString, IsNumber, IsUrl } from 'class-validator';

export class CreatePlantDto {
  
  imageUrl: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  quantity: number;
}