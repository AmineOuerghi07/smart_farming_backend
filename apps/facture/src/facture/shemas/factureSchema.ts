import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from "apps/auth/src/identity/entities/user.entity";

import { Types } from "mongoose";


@Schema()
export class Facture  {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true, default: Date.now })
  issueDate: Date;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true, type: 'ObjectId', ref: 'User' }) 
   user: User;
    
  
  

 
}

export const FactureSchema = SchemaFactory.createForClass(Facture);
