import { PartialType } from '@nestjs/mapped-types';
import { CreateLandDto } from './create-land.dto';
import { ObjectId } from 'mongoose';

export class UpdateLandDto extends PartialType(CreateLandDto) {
  id: ObjectId ;
}
