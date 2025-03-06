import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Sensor extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  type: string;
  @Prop({ required: true, default: 0 })
  value: number;

  @Prop({ required: true })
  threshold: number;
  @Prop({ default: Date.now })
  createdAt: Date;
}

export const SensorSchema = SchemaFactory.createForClass(Sensor);