
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from 'mongoose';

@Schema()
export class Plant {
    @Prop()
    imageUrl: string;
    @Prop()
    name: string;
    @Prop()
    description: string;

    @Prop({ type: Number, required: false })
    plantingYear?: number;

    @Prop({ type: [String], enum: ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER'], required: false })
    plantingSeasons: string[];

    @Prop({ type: Date, required: false })
    plantingDate?: Date;
}
export const PlantSchema = SchemaFactory.createForClass(Plant);