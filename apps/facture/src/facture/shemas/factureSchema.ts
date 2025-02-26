import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";


@Schema()
export class Facture  {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true, default: Date.now })
  issueDate: Date;

  @Prop({ required: true })
  totalAmount: number;
}

export const FactureSchema = SchemaFactory.createForClass(Facture);
