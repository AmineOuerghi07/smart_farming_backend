import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Plant {
    @Prop()
    imageUrl: string;
    @Prop()
    name: string;
    @Prop()
    description: string;


}
export const PlantSchema = SchemaFactory.createForClass(Plant);