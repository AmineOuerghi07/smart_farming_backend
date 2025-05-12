import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Schema as MongooseSchema } from "mongoose";
class OrderItem {
    @Prop({ type: String, required: true }) // ✅ Ensure productId is stored as a string
    productId: string;

    @Prop({ type: Number, required: true })
    quantity: number;
}
@Schema()
export class Order {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer', required: false })
    customerId: Types.ObjectId; // Reference to Customer

    @Prop({ required: true, default: 'pending' })
    orderStatus: string;

    @Prop({ type: [OrderItem], required: true })
    orderItems: Array<{
        productId: string;
        quantity: number;
    }>;
    @Prop({required: false })
    referenceId: string;
    @Prop({ required: true })
    totalAmount: number;

    @Prop({ required: true, default: Date.now })
    createdAt: Date;

}
export const OrderSchema = SchemaFactory.createForClass(Order);