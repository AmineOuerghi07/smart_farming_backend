import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';
import { User } from '../../users/entities/user.entity';


@Schema()
export class Land {
  @Prop({ required: true })
  name: string;

  @Prop({ type: 'ObjectId', ref: 'User' })
  user: User;

  @Prop([{ type: 'ObjectId', ref: 'Region' }])
  regions: ObjectId[];
}

export const LandSchema = SchemaFactory.createForClass(Land);