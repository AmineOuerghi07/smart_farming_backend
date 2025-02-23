import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }
  @Get()
  async findAll() {
    return this.productService.findAll();
  }

  @Get('id')
  async findOne(@Body() { id }) {
    return this.productService.findOne(id);
  }

  @Post()
  async create(@Body() {
    name, description, price, quantity, stockQuantity, createdAt, updatedAt }) {
    return this.productService.create({
      name, description, price, quantity, stockQuantity, createdAt, updatedAt
    })
  }

  @Patch()
  async update(@Body() { id,
    name, description, price, quantity, stockQuantity, createdAt, updatedAt }) {
    return this.productService.update({
      id,
      name, description, price, quantity, stockQuantity, createdAt, updatedAt
    })

  }

  @Delete()
  async remove(@Body() { id }) {
    return this.productService.remove(id)
  }

}
