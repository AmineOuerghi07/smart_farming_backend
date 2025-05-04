import { IsString, IsNumber, IsUrl, IsOptional, IsDate } from 'class-validator';

export class CreatePlantDto {


  @IsString()
  name: string;

  @IsString()
  description: string;

 
}