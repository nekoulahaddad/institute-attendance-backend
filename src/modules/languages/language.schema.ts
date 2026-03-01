import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LanguageDocument = Language & Document;

@Schema({ _id: false })
export class LanguageLabel {
  @Prop({ required: true })
  en: string;

  @Prop({ required: true })
  ar: string;
}

export const LanguageLabelSchema = SchemaFactory.createForClass(LanguageLabel);

@Schema({ timestamps: true })
export class Language {
  @Prop({ type: LanguageLabelSchema, required: true })
  language: LanguageLabel;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Level' }], default: [] })
  levels: Types.ObjectId[];
}

export const LanguageSchema = SchemaFactory.createForClass(Language);
