import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  EMPLOYEE = 'employee',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum UserStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  CANCELED = 'canceled',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  arabicName: string;

  @Prop({ required: true })
  englishName: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop()
  verificationCodeHash?: string;

  @Prop()
  verificationCodeExpiresAt?: Date;

  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @Prop({ required: true, enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Prop({ required: true })
  language: string;

  @Prop({ required: true })
  level: string;

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId;

  @Prop()
  profileImageUrl: string;

  @Prop()
  passwordHash?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ branchId: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
