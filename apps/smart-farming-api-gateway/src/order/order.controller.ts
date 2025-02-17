import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
    constructor(private readonly orderService : OrderService){}

    @Get()
    async findAll()
    {
        return this.orderService.findAll();
    }

    @Post()
    async create(@Body(){name,idUser, date})
    {
        return this.orderService.create({name ,idUser , date})
    }
}
