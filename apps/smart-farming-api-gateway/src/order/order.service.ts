import { ORDER_PATTERNS } from '@app/contracts/order/order.patterns';
import { ORDER_NAME } from '@app/contracts/order/order.rmq';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class OrderService {
    constructor(@Inject(ORDER_NAME) private client : ClientProxy){}

    async findAll()
    {
        return this.client.send(ORDER_PATTERNS.FIND_ALL, {})
    }

    async create({idUser, date, name})
    {
        return this.client.send(ORDER_PATTERNS.CREATE, {idUser, date, name})
    }
}
