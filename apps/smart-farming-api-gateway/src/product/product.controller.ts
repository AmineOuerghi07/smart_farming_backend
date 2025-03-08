import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product.service';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CreateProductDto } from '@app/contracts/product/dto/create-product.dto';
export const getUploadPath = (subdirectory: string) => {
  const rootPath = join(process.cwd(), 'assets', subdirectory);
  
  if (!existsSync(rootPath)) {
    mkdirSync(rootPath, { recursive: true });
  }

  return rootPath;
};
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
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: getUploadPath('products'),
      filename: (req, file, callback) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = file.originalname.split('.').pop();
        const filename = `product-${uniqueName}.${ext}`;
        callback(null, filename);
      },
    }),
  }))
  @Post()
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    console.log('Raw body:', body); // Debug log

    // Handle potential arrays by taking the first value
    const createProductDto: CreateProductDto = {
      name: Array.isArray(body.name) ? body.name[0] : body.name,
      category: Array.isArray(body.category) ? body.category[0] : body.category,
      description: Array.isArray(body.description) ? body.description[0] : body.description || undefined,
      price: parseFloat(Array.isArray(body.price) ? body.price[0] : body.price),
      quantity: body.quantity ? parseInt(Array.isArray(body.quantity) ? body.quantity[0] : body.quantity, 10) : undefined,
      stockQuantity: parseInt(Array.isArray(body.stockQuantity) ? body.stockQuantity[0] : body.stockQuantity, 10),
    };

    const filePath = file ? `products/${file.filename}` : null;
    const dtoWithFile = { ...createProductDto, image: filePath };

    console.log('dtoWithFile:', dtoWithFile); // Debug log
    return this.productService.create(dtoWithFile);
  }
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: getUploadPath('products'),
      filename: (req, file, callback) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = file.originalname.split('.').pop();
        const filename = `product-${uniqueName}.${ext}`;
        callback(null, filename);
      },
    }),
  }))
  @Patch(':id')  // Changed to use route parameter
  async update(
    @Param('id') id: string,  // Added id parameter
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    console.log('Raw body:', body);
    console.log('Product ID from param:', id);

    const updateProductDto = {
      id: id,  // Use the ID from the route parameter
      name: Array.isArray(body.name) ? body.name[0] : body.name,
      category: Array.isArray(body.category) ? body.category[0] : body.category,
      description: Array.isArray(body.description) ? body.description[0] : body.description || undefined,
      price: body.price ? parseFloat(Array.isArray(body.price) ? body.price[0] : body.price) : undefined,
      quantity: body.quantity ? parseInt(
        Array.isArray(body.quantity) 
          ? body.quantity[0]
          : body.quantity, 
        10
      ) : undefined,
      stockQuantity: body.stockQuantity ? parseInt(
        Array.isArray(body.stockQuantity) 
          ? body.stockQuantity[0] 
          : body.stockQuantity, 
        10
      ) : undefined,
      createdAt: body.createdAt ? (Array.isArray(body.createdAt) ? body.createdAt[0] : body.createdAt) : undefined,
      updatedAt: body.updatedAt ? (Array.isArray(body.updatedAt) ? body.updatedAt[0] : body.updatedAt) : undefined,
    };

    if (Array.isArray(body.quantity) && body.quantity.length > 1) {
      console.warn('Multiple quantity values provided, using first value only:', body.quantity);
    }

    const filePath = file ? `products/${file.filename}` : undefined;
    const dtoWithFile = { ...updateProductDto, image: filePath };

    console.log('dtoWithFile:', dtoWithFile);
    return this.productService.update(dtoWithFile);
  }
  @Delete()
  async remove(@Body() { id }) {
    return this.productService.remove(id)
  }

}
