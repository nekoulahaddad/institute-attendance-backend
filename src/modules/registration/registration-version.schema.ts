import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

export type RegistrationVersionDocument = RegistrationVersion & Document;

@Schema({ timestamps: true })
export class RegistrationVersion {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  version: number;

  @Prop({ type: Object, required: true })
  snapshot: any; // نسخة كاملة من بيانات المستخدم

  @Prop({ type: [String] })
  modifiedFields: string[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  modifiedBy: Types.ObjectId | null; // null لو المستخدم نفسه
}

export const RegistrationVersionSchema =
  SchemaFactory.createForClass(RegistrationVersion);

RegistrationVersionSchema.index({ userId: 1, version: -1 });
