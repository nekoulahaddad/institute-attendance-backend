import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NewsDocument = News & Document;

export class LocalizedText {
  @Prop({ required: true })
  en: string;

  @Prop({ required: true })
  ar: string;
}

export const LocalizedTextSchema = SchemaFactory.createForClass(LocalizedText);

@Schema({ timestamps: true })
export class News {
  @Prop({ type: LocalizedTextSchema, required: true })
  title: LocalizedText;

  @Prop({ type: LocalizedTextSchema, required: true })
  summary: LocalizedText;

  @Prop({ type: LocalizedTextSchema, required: true })
  category: LocalizedText;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  publishedAt: Date;
}

export const NewsSchema = SchemaFactory.createForClass(News);

NewsSchema.index({ publishedAt: -1 });
