// src/regions/dto/create-region.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRegionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  land: string;

  @IsNotEmpty()
  @IsString()
  sensors: string [];
  @IsString()
  plants:string[]
}