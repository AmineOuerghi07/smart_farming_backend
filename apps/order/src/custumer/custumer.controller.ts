import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { CustomerService } from './custumer.service';
import { CreateCustomerDto } from './dto/create-custumer.dto';
import { UpdateCustomerDto } from './dto/update-custumer.dto';
import { CUSTOMER_PATTERNS } from '@app/contracts/facture/customer/customer.patterns';

@Controller()
export class CustumerController {
  constructor(private readonly custumerService: CustomerService) {}

  @EventPattern(CUSTOMER_PATTERNS.CREATE)
  async create(@Payload() createCustumerDto: CreateCustomerDto) {
    return await this.custumerService.create(createCustumerDto);
  }

  @MessagePattern(CUSTOMER_PATTERNS.FIND_ALL)
  async findAll() {
    return await this.custumerService.findAll();
  }

  @MessagePattern(CUSTOMER_PATTERNS.FIND_ONE)
  async findOne(@Payload() id: string) {
    return await this.custumerService.findOne(id);
  }

  @MessagePattern(CUSTOMER_PATTERNS.UPDATE)
  async update(@Payload() updateCustumerDto: UpdateCustomerDto) {
    try
    {
      return await this.custumerService.update(updateCustumerDto._id.toString(), updateCustumerDto);
    }catch(e)
    {
      throw e;
    }
    
  }

  @EventPattern(CUSTOMER_PATTERNS.REMOVE)
  async remove(@Payload() id: string) {
    return await this.custumerService.remove(id);
  }

  @EventPattern(CUSTOMER_PATTERNS.CANCEL_CREATION)
  async cancelCreation(id : string)
  {
    await this.custumerService.cancelCreation(id)
  }

  @EventPattern(CUSTOMER_PATTERNS.CANCEL_UPDATE)
  async cancelUpdate(id : string)
  {
    await this.custumerService.cancelUpdate(id)
  }

  @EventPattern(CUSTOMER_PATTERNS.CANCEL_REMOVE)
  async cancelRemove(id : string)
  {
    await this.custumerService.cancelRemove(id)
  }

  
}
