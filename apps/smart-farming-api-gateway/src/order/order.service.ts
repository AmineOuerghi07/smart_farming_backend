import { ORDER_PATTERNS } from '@app/contracts/order/order.patterns';
import { ORDER_NAME } from '@app/contracts/order/order.rmq';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class OrderService {
    constructor(@Inject(ORDER_NAME) private client: ClientProxy) { }

    async findAll() {
        return this.client.send(ORDER_PATTERNS.FIND_ALL, {})
    }

    async create({ totalAmount, customerId, orderStatus }) {
        return this.client.send(ORDER_PATTERNS.CREATE, { totalAmount, customerId, orderStatus })
    }

    async findOne(id) {
        return this.client.send(ORDER_PATTERNS.FIND_ONE, id)
    }

    async update({ id, totalAmount, customerId, orderStatus }) {
        return this.client.send(ORDER_PATTERNS.UPDATE, { id, totalAmount, customerId, orderStatus })
    }

    async remove(id) {
        return this.client.send(ORDER_PATTERNS.REMOVE, id)
    }
}
