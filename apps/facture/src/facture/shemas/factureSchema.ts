import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { Types } from "mongoose";
import { Customer } from "../../customer/schema/customerSchema";


@Schema()
export class Facture  {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true, default: Date.now })
  issueDate: Date;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true, type: 'ObjectId', ref: 'User' }) 
   user: Customer;
    
  
  

 
}

export const FactureSchema = SchemaFactory.createForClass(Facture);
