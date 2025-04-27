import { IsString, IsNumber, IsUrl, IsOptional } from 'class-validator';

export class CreatePlantDto {


  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsOptional()
  plantingYear?: number;

 

  
}