import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Region } from "../../regions/entities/region.entity";

@Schema()
export class Sensor {
    @Prop()
    name : string 
    
    @Prop({ type: 'ObjectId', ref: 'Region' })
    region: Region;
    
}
export const SensorSchema = SchemaFactory.createForClass(Sensor);
