import { PRODUCT_PATTERNS } from '@app/contracts/product/product.patterns';
import { PRODUCT_NAME } from '@app/contracts/product/product.rmq';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ProductService {
  constructor(@Inject(PRODUCT_NAME) private client: ClientProxy) { }

  async findAll() {
    return this.client.send(PRODUCT_PATTERNS.FIND_ALL, {})
  }

  async create({
    name, description, price, quantity, stockQuantity, createdAt, updatedAt }) {
    return this.client.send(PRODUCT_PATTERNS.CREATE, { name, description, price, quantity, stockQuantity, createdAt, updatedAt })
  }

  async findOne(id) {
    return this.client.send(PRODUCT_PATTERNS.FIND_ONE, id)
  }

  async update({ id, name, description, price, quantity, stockQuantity, createdAt, updatedAt }) {
    return this.client.send(PRODUCT_PATTERNS.UPDATE, { id, name, description, price, quantity, stockQuantity, createdAt, updatedAt })
  }

  async remove(id) {
    return this.client.send(PRODUCT_PATTERNS.REMOVE, id)
  }
}
