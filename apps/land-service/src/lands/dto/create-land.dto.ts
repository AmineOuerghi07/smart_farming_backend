// src/lands/dto/create-land.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateLandDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  user: ObjectId;
}

