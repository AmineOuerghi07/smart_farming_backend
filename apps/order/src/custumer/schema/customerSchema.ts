import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";


@Schema()
export class Customer {

  @Prop({'_id' : true})
  _id : Types.ObjectId
  

  @Prop({ required: true })
  name: string;


  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

}

export const CustomerSchema = SchemaFactory.createForClass(Customer);