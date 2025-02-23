import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Sensor } from "../../sensors/entities/sensor.entity";

@Schema()
export class Region {
    @Prop()
    name : string 
    
    @Prop([{ type: 'ObjectId', ref: 'Sensor' }])
    sensors: Sensor[];
    
}
export const RegionSchema = SchemaFactory.createForClass(Region);

