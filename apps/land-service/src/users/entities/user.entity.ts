import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';

@Schema()
export class User {
 
  @Prop({ required: true })
  email: string;

  @Prop()
  name: string;
}

export const UserSchema = SchemaFactory.createForClass(User);