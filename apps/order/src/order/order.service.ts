import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './entities/order.entity';
import { Model } from 'mongoose';


@Injectable()
export class OrderService {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>){}
  async create(createOrderDto: CreateOrderDto) {
    return await this.orderModel.create(createOrderDto)  
  }

  async findAll() {
    return await this.orderModel.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
