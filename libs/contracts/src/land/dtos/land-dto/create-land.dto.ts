// src/lands/dto/create-land.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLandDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  image?: string;
  @IsNotEmpty()
  @IsString()
  userId: string;
}

