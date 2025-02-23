import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";


@Schema()
export class Customer {
  @Prop({ required: true })
  customerName: string;


  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
