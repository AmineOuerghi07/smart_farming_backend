import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema()
export class User extends Document {
 
  
  @Prop({ required: true })
  email: string;

  @Prop()
  name: string;

  @Prop({  })
  phone: string;
}

export const UserSchema = SchemaFactory.createForClass(User);