import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Order {
    @Prop()
    date : string

    @Prop()
    idUser : string

    @Prop()
    name : string

}

export const OrderSchema = SchemaFactory.createForClass(Order)