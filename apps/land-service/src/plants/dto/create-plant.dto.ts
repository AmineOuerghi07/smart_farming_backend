import { IsString, IsNumber, IsUrl } from 'class-validator';

export class CreatePlantDto {


  @IsString()
  name: string;

  @IsString()
  description: string;

  
}