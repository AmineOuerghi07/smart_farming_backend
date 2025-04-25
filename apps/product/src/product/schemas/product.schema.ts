import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsOptional, IsString } from "class-validator";

@Schema({ timestamps: true })
export class Product {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    category: string;

    @Prop({ required: false })
    description: string;

    @Prop({ required: true })
    price: number;
    @Prop({ required: true })
    stockQuantity: number;
    @Prop({ required: false })
    createdAt: Date;
    @Prop({ required: false })
    updatedAt: Date;
    @Prop()
    image?: string;
    @Prop({ required: false })
    rating?: { user_id: string, rating: number }[]

}
export const ProductSchema = SchemaFactory.createForClass(Product);
