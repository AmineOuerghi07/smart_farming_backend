import { Inject, Injectable } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { INVENTORY_NAME } from '@app/contracts/inventory/inventory.rmq';
import { ClientProxy } from '@nestjs/microservices';
import { INVENTORY_PATTERNS } from '@app/contracts/inventory/inventory.patterns';

@Injectable()
export class InventoryService {
  constructor(@Inject(INVENTORY_NAME) private client : ClientProxy){}
  create(createInventoryDto: CreateInventoryDto) {
    return 'This action adds a new inventory';
  }

  findAll() {
    return this.client.send(INVENTORY_PATTERNS.FIND_ALL, {});
  }

  findOne(id: number) {
    return `This action returns a #${id} inventory`;
  }

  update(id: number, updateInventoryDto: UpdateInventoryDto) {
    return `This action updates a #${id} inventory`;
  }

  remove(id: number) {
    return `This action removes a #${id} inventory`;
  }
}
