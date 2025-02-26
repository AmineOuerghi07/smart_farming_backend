import { PartialType } from '@nestjs/mapped-types';
import { CreateFactureDto } from './create-facture.dto';

export class UpdateFactureDto extends PartialType(CreateFactureDto) {
  id: number;
}
