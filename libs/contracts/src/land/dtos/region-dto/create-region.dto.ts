// src/regions/dto/create-region.dto.ts
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRegionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  land: string;
  @IsNumber()
  surface: number;
  @IsNotEmpty()
  @IsString()
  sensors: string[];
  @IsString()
  plants:string[]
}