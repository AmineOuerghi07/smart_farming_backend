import mongoose, { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Types } from "mongoose"

@Schema()
export class Otp {

    @Prop()
    otp: string
    @Prop()
    otpExpires: Date

    @Prop({
        type: Types.ObjectId,
        ref: 'user'})
    userId: Types.ObjectId
}

export const OtpSchema = SchemaFactory.createForClass(Otp)