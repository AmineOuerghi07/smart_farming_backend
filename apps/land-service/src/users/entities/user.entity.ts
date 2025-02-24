import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';


@Schema()
export class User {
 
  @Prop({'_id' : true})
  _id : Types.ObjectId
  
  @Prop({ required: true })
  email: string;

  @Prop()
  name: string;

  @Prop({ required: true })
  phone: string;
}

export const UserSchema = SchemaFactory.createForClass(User);