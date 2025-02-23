import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FactureService } from './facture.service';
import { CreateFactureDto } from './dto/create-facture.dto';
import { UpdateFactureDto } from './dto/update-facture.dto';
import { FACTURE_PATTERNS } from '@app/contracts/facture/facture.patterns';

@Controller()
export class FactureController {
  constructor(private readonly factureService: FactureService) {}

  @MessagePattern(FACTURE_PATTERNS.CREATE)
  create(@Payload() createFactureDto: CreateFactureDto) {
    return this.factureService.create(createFactureDto);
  }

  @MessagePattern(FACTURE_PATTERNS.FIND_ALL)
  findAll() {
    return this.factureService.findAll();
  }

  @MessagePattern(FACTURE_PATTERNS.FIND_ONE)
  findOne(@Payload() id: string) {
    return this.factureService.findOne(id);
  }

  
  @MessagePattern(FACTURE_PATTERNS.UPDATE)
  update(@Payload() updateFactureDto: UpdateFactureDto) {
    return this.factureService.update(updateFactureDto.id, updateFactureDto);
  }

  @MessagePattern(FACTURE_PATTERNS.REMOVE)
  remove(@Payload() id: string) {
    return this.factureService.remove(id);
  }
}
