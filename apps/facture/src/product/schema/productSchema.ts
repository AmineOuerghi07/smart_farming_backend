import { Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Product {
    name: string;
    description: string;
    price: number;
    quantity: number;
    stockQuantity: number;
    createdAt: Date;
    updatedAt: Date;

}
export const ProductSchema = SchemaFactory.createForClass(Product);