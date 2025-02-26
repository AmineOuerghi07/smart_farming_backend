import { Inject, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './schemas/product.schema';
import { Model } from 'mongoose';

@Injectable()
export class ProductService {
  constructor(@InjectModel(Product.name) private poductModel: Model<Product> ) {}

  create(createProductDto: CreateProductDto) {
    return new this.poductModel(createProductDto).save();
  }

  findAll() {
    return this.poductModel.find();
  }

  findOne(id: string) {
    return this.poductModel.findById(id);
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.poductModel.findByIdAndUpdate
    (id, updateProductDto, {new: true});
  }

  remove(id: string) {
    return this.poductModel.findByIdAndDelete(id);
  }
}
