// src/regions/dto/create-region.dto.ts
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateRegionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  land: string;

  @IsOptional()
  @IsNumber()
  surface?: number;

  @IsNotEmpty()
  @IsString()
  sensors: string[];

  @IsString()
  plants: string[];
}