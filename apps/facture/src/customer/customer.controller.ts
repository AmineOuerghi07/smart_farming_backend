import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerService } from './costumer.service';
import { CUSTOMER_PATTERNS } from '@app/contracts/facture/customer/customer.patterns';

@Controller()
export class CustomerController {
  constructor(private readonly customerService: CustomerService) { }

  @EventPattern(CUSTOMER_PATTERNS.CREATE)
  async create(@Payload() createCustomerDto: CreateCustomerDto) {
    return await this.customerService.create(createCustomerDto);
  }

  @MessagePattern(CUSTOMER_PATTERNS.FIND_ALL)
  async findAll() {
    return await this.customerService.findAll();
  }

  @MessagePattern(CUSTOMER_PATTERNS.FIND_ONE)
  async findOne(@Payload() id: string) {
    return await this.customerService.findOne(id);
  }

  @MessagePattern(CUSTOMER_PATTERNS.UPDATE)
  async update(@Payload() payload: UpdateCustomerDto) {
    try {
      return await this.customerService.update(payload._id.toString(), payload);

    } catch (e) {
      throw e
    }
  }

  @EventPattern(CUSTOMER_PATTERNS.REMOVE)
  async remove(@Payload() id: string) {
    return await this.customerService.remove(id);
  }

 
  @EventPattern(CUSTOMER_PATTERNS.CANCEL_CREATION)
  async cancelCreation(id : string)
  {
    await this.customerService.cancelCreation(id)
  }

  @EventPattern(CUSTOMER_PATTERNS.CANCEL_UPDATE)
  async cancelRemove(id : string)
  {
    await this.customerService.cancelUpdate(id)
  }

  @EventPattern(CUSTOMER_PATTERNS.CANCEL_REMOVE)
  async cancelUpdate(id : string)
  {
    await this.customerService.cancelRemove(id)
  }
}
