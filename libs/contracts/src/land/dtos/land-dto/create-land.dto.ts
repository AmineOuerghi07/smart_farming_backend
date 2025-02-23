// src/lands/dto/create-land.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLandDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  userId: string;
}

