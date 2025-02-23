import { Controller, Get } from '@nestjs/common';
import { FactureService } from './facture.service';

@Controller()
export class FactureController {
  constructor(private readonly factureService: FactureService) {}

  @Get()
  getHello(): string {
    return this.factureService.getHello();
  }
}
