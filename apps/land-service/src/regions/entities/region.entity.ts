import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Land } from "../../lands/entities/land.entity";
import { Sensor } from "../../sensors/entities/sensor.entity";
import { Document } from 'mongoose';
import { Plant } from "../../plants/entities/plant.entity";

@Schema()
export class Region extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: 'ObjectId', ref: 'Land' })
  land: Land;

  @Prop([{ type: 'ObjectId', ref: 'Sensor' }])
  sensors: Sensor[];
  @Prop([{ type: 'ObjectId', ref: 'Plant' }])
  plants: Plant[]
}
export const RegionSchema = SchemaFactory.createForClass(Region);
