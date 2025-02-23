import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";


export enum Role
{
    "ADMIN", "USER"
}

@Schema()
export class User {


    @Prop()
    fullname: string
    
    @Prop()
    email : string

    @Prop()
    password : string

    @Prop()
    phonenumber : string
    
    @Prop()
    address: string

    @Prop()
    roles : Role[]

    @Prop()
    isVerified: boolean
}

export const userSchema = SchemaFactory.createForClass(User)