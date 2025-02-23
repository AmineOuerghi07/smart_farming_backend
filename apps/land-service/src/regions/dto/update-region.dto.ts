import { PartialType } from '@nestjs/mapped-types';
import { CreateRegionDto } from './create-region.dto';
import { ObjectId } from 'mongoose';

export class UpdateRegionDto extends PartialType(CreateRegionDto) {
  id: string;
}
