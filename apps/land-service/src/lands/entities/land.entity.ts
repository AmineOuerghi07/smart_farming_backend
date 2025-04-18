import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Types } from 'mongoose';
import { User } from '../../users/entities/user.entity';
import { Region } from '../../regions/entities/region.entity';


@Schema()
export class Land extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  cordonate: string;  // Consider using GeoJSON for coordinates
  
  @Prop({ required: true, default: false })
  forRent: boolean;
  @Prop({ required: false, default: 0 }) // New field for rental price
  rentPrice: number;
  @Prop({ required: true })
  surface: number;

  @Prop()
  image: string;

  @Prop({ type: 'ObjectId', ref: 'User' }) // Reference to User
  user: Types.ObjectId | User;

  @Prop([{ type: Types.ObjectId, ref: 'Region' }])
  regions:  Region[];
}

export const LandSchema = SchemaFactory.createForClass(Land);