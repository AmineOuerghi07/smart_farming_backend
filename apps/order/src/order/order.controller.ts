import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ORDER_PATTERNS } from '@app/contracts/order/order.patterns';


@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  static mapOrderPayload(payload: any) {
    let orderDTO = new CreateOrderDto();
    orderDTO.totalAmount = payload.totalAmount;
    orderDTO.customerId = null;
    orderDTO.orderStatus = payload.orderStatus;
    orderDTO.orderItems = payload.orderItems;
    return orderDTO;
  }
  @MessagePattern(ORDER_PATTERNS.CREATE)
  create(@Payload() createOrderDto: CreateOrderDto) {

    createOrderDto.referenceId = OrderController.generateReferenceId();
    return this.orderService.create(createOrderDto);
  }
  static generateReferenceId(): string {

    return Math.floor(100000 + Math.random() * 900000).toString();


  }
  
  @MessagePattern(ORDER_PATTERNS.FIND_ALL)
  findAll() {
    return this.orderService.findAll();
  }

  @MessagePattern(ORDER_PATTERNS.FIND_ONE)
  findOne(@Payload() id: string) {
    return this.orderService.findOne(id);
  }

  @MessagePattern(ORDER_PATTERNS.UPDATE)
  update(@Payload() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(updateOrderDto.id, updateOrderDto);
  }

  @MessagePattern(ORDER_PATTERNS.REMOVE)
  remove(@Payload() id: string) {
    return this.orderService.remove(id);
  }
  
}
