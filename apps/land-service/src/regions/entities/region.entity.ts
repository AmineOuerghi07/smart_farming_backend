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
  @Prop({ type: 'ObjectId', ref: 'Land' })
  land: Land;

  @Prop([{ type: 'ObjectId', ref: 'Sensor' }])
  sensors: (Types.ObjectId | Sensor)[];
  @Prop({
    type: [{
      plant: { type: 'ObjectId', ref: 'Plant' },
      quantity: { type: Number, default: 0 }
    }],
    default: [], // Critical: Ensures plants is always an array
  })
  plants: { plant: Types.ObjectId; quantity: number }[];

  @Prop({ type: Boolean, default: false })
  isConnected: boolean;
}
export const RegionSchema = SchemaFactory.createForClass(Region);
