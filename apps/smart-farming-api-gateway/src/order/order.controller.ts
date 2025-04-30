import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Get()
    async findAll() {
        return this.orderService.findAll();
    }

    @Get('id')
    async findOne(@Body() { id }) {
        return this.orderService.findOne(id);
    }

    @Post()
    async create(@Body() { totalAmount, customerId, orderStatus , orderItems }) {
        return this.orderService.create({ totalAmount, customerId, orderStatus , orderItems})
    }

    @Patch()
    async update(@Body() { id, totalAmount, customerId, orderStatus }) {
        return this.orderService.update({ id, totalAmount, customerId, orderStatus })

    }

    @Delete()
    async remove(@Body() { id }) {
        return this.orderService.remove(id)
    }



}
