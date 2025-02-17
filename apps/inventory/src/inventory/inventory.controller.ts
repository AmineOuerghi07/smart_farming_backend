import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { INVENTORY_PATTERNS } from '@app/contracts/inventory/inventory.patterns';

@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @MessagePattern(INVENTORY_PATTERNS.CREATE)
  create(@Payload() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @MessagePattern(INVENTORY_PATTERNS.FIND_ALL)
  findAll() {
    return this.inventoryService.findAll();
  }

  @MessagePattern(INVENTORY_PATTERNS.FIND_ONE)
  findOne(@Payload() id: number) {
    return this.inventoryService.findOne(id);
  }

  @MessagePattern(INVENTORY_PATTERNS.UPDATE)
  update(@Payload() updateInventoryDto: UpdateInventoryDto) {
    return this.inventoryService.update(updateInventoryDto.id, updateInventoryDto);
  }

  @MessagePattern(INVENTORY_PATTERNS.REMOVE)
  remove(@Payload() id: number) {
    return this.inventoryService.remove(id);
  }
}
