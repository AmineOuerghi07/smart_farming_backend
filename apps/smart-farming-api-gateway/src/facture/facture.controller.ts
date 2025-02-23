import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { FactureService } from './facture.service';

@Controller('facture')
export class FactureController {
  constructor(private readonly factureService: FactureService) { }

  @Get()
  async findAll() {
    return this.factureService.findAll();
  }

  @Get('id')
  async findOne(@Body() { id }) {
    return this.factureService.findOne(id);
  }

  @Post()
  async create(@Body() { orderId ,issueDate ,totalAmount }) {
    return this.factureService.create({ orderId ,issueDate ,totalAmount })
  }

  @Patch()
  async update(@Body() { id, orderId ,issueDate ,totalAmount }) {
    return this.factureService.update({ id, orderId ,issueDate ,totalAmount })

  }

  @Delete()
  async remove(@Body() { id }) {
    return this.factureService.remove(id)
  }
}
