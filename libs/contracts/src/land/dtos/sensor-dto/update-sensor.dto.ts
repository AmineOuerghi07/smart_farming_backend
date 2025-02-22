import { PartialType } from '@nestjs/mapped-types';
import { CreateSensorDto } from './create-sensor.dto';
import { ObjectId } from 'mongoose';

export class UpdateSensorDto extends PartialType(CreateSensorDto) {
  id: string;
}
