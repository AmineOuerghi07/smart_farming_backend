import { CreateProductDto } from '@app/contracts/product/dto/create-product.dto';
import { PRODUCT_PATTERNS } from '@app/contracts/product/product.patterns';
import { PRODUCT_NAME } from '@app/contracts/product/product.rmq';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ProductService {
  constructor(@Inject(PRODUCT_NAME) private client: ClientProxy) { }

  async findAll() {
    return this.client.send(PRODUCT_PATTERNS.FIND_ALL, {})
  }

  async create(createProductDto: CreateProductDto) {
    console.log('Sending to microservice:', createProductDto); // Debug log
    return lastValueFrom(this.client.send(PRODUCT_PATTERNS.CREATE, createProductDto));
  }
  async findOne(id) {
    return this.client.send(PRODUCT_PATTERNS.FIND_ONE, id)
  }

  async update(updateProductDto: any) {
    console.log('Sending to microservice:', updateProductDto); // Debug log
    return lastValueFrom(this.client.send(PRODUCT_PATTERNS.UPDATE, updateProductDto));
}

  async remove(id) {
    return this.client.send(PRODUCT_PATTERNS.REMOVE, id)
  }
}
