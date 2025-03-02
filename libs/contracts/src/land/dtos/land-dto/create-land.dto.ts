// src/lands/dto/create-land.dto.ts
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLandDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  cordonate: string;

  @IsBoolean()
  forRent: boolean;

  @IsNumber()
  surface: number;



  @IsNotEmpty()
  user: string;  // User ID

  @IsOptional()
  regions?: string[];
}

