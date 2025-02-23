import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schema/productSchema';

@Injectable()
export class ProductService {
  constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}

  // Create a new product
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const newProduct = new this.productModel(createProductDto);
    return await newProduct.save();
  }

  // Get all products
  async findAll(): Promise<Product[]> {
    return await this.productModel.find();
  }

  // Get a single product by ID
  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  // Update a product by ID
  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const updatedProduct = await this.productModel.findByIdAndUpdate(id, updateProductDto, { new: true });
    if (!updatedProduct) throw new NotFoundException(`Product with ID ${id} not found`);
    return updatedProduct;
  }

  // Delete a product by ID
  async remove(id: string): Promise<{ message: string }> {
    const deletedProduct = await this.productModel.findByIdAndDelete(id);
    if (!deletedProduct) throw new NotFoundException(`Product with ID ${id} not found`);
    return { message: `Product with ID ${id} deleted successfully` };
  }
}
