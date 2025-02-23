import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './schemas/orderSchema';

@Injectable()
export class OrderService {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) { }

  async create(createOrderDto: CreateOrderDto) {
    try {
      return await this.orderModel.create(createOrderDto);
      
    } catch (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  async findAll() {
    return await this.orderModel.find(); 
  }

  async findOne(id: string) {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const updatedOrder = await this.orderModel.findByIdAndUpdate(id, updateOrderDto, {
      new: true, // Return the updated document
      runValidators: true, // Ensure validation runs
    });

    if (!updatedOrder) throw new NotFoundException(`Order with ID ${id} not found`);
    return updatedOrder;
  }

  async remove(id: string) {
    const deletedOrder = await this.orderModel.findByIdAndDelete(id);
    if (!deletedOrder) throw new NotFoundException(`Order with ID ${id} not found`);
    return { message: 'Order deleted successfully' };
  }
}