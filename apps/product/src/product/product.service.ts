import { Inject, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './schemas/product.schema';
import { Model } from 'mongoose';

@Injectable()
export class ProductService {
  constructor(@InjectModel(Product.name) private productModel: Model<Product> ) {}

  create(createProductDto: CreateProductDto) {
    console.log('Saving to DB:', createProductDto); // Debug log
    return new this.productModel(createProductDto).save();
  }

  findAll() {
    return this.productModel.find();
  }

  findOne(id: string) {
    return this.productModel.findById(id);
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.productModel.findByIdAndUpdate
    (id, updateProductDto, {new: true});
  }

  remove(id: string) {
    return this.productModel.findByIdAndDelete(id);
  }
}
