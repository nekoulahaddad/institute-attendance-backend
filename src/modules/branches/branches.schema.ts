import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class LocalizedText {
  @Prop({ required: true })
  en: string;

  @Prop({ required: true })
  ar: string;
}

export const LocalizedTextSchema = SchemaFactory.createForClass(LocalizedText);

@Schema({ timestamps: true })
export class Branch {
  @Prop({ type: LocalizedTextSchema, required: true })
  name: LocalizedText;

  @Prop({ required: true })
  code: string;

  @Prop({ type: LocalizedTextSchema, required: true })
  address: LocalizedText;

  @Prop()
  phone: string;
}

export const BranchSchema = SchemaFactory.createForClass(Branch);
