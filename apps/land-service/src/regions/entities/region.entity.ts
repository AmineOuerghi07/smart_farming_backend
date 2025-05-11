import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Land } from "../../lands/entities/land.entity";
import { Sensor } from "../../sensors/entities/sensor.entity";
import {  Types } from 'mongoose';

@Schema()
export class Region  {
  @Prop({ required: true })
  name: string;
  @Prop()
  surface: number;
  @Prop()
  description: string;
  @Prop({ type: 'ObjectId', ref: 'Land' })
  land: Land;

  @Prop([{ type: 'ObjectId', ref: 'Sensor' }])
  sensors: (Types.ObjectId | Sensor)[];
 @Prop({
    type: [{
      plant: { type: 'ObjectId', ref: 'Plant' },
      quantity: { type: Number, default: 0 },
      plantingDate: { type: Date }
    }],
    default: [], // Critical: Ensures plants is always an array
  })
  plants: { plant: Types.ObjectId; quantity: number; plantingDate?: Date }[];

  @Prop({ type: Boolean, default: false })
  isConnected: boolean;

  
  @Prop({
    type: [{
      description: String,
      done: Boolean,
      date: String,      // date de création
      doneDate: String   // date de validation
    }],
    default: [],
  })
  activities?: { description: string; done: boolean; date?: string; doneDate?: string }[];
}
export const RegionSchema = SchemaFactory.createForClass(Region);
