// src/regions/dto/create-region.dto.ts
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRegionDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  description: string;
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