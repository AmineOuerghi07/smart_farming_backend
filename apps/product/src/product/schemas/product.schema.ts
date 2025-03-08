import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
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

}
export const ProductSchema = SchemaFactory.createForClass(Product);
