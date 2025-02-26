import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Schema as MongooseSchema } from "mongoose";

@Schema()
export class Order {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer', required: false })
    customerId: Types.ObjectId; // Reference to Customer

    @Prop({ required: true, default: 'pending' })
    orderStatus: string;

    @Prop({ required: true })
    orderItems: Array<{
        productId: string;
        quantity: number;
    }>;

    @Prop({ required: true })
    totalAmount: number;

    @Prop({ required: true, default: Date.now })
    createdAt: Date;

}
export const OrderSchema = SchemaFactory.createForClass(Order);