import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from "../../users/entities/user.entity";
import { Types } from "mongoose";
import { Land } from "./land.entity";

import { Document } from "mongoose";

@Schema()
export class LandRequest extends Document
{
    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    requestingUser: User // User ID of the person requesting the land 

    @Prop({ required: true, type: Types.ObjectId, ref: 'Land' })
    landId: Land  // ID of the land being requested
    
    @Prop({ required: true, default: new Date().toLocaleDateString() })
    requestDate: string; // Date of the request
    
    @Prop({ required: true, default: 'pending' })
    status: string; // Status of the request (e.g., pending, approved, rejected)
}

export const LandRequestSchema = SchemaFactory.createForClass(LandRequest);