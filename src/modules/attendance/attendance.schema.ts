import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export enum AttendanceType {
  IN = 'IN',
  OUT = 'OUT',
}

@Schema({ timestamps: true })
export class AttendanceEvent {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId;

  @Prop({ required: true, enum: AttendanceType })
  type: AttendanceType;

  @Prop({ required: true })
  scannedAt: Date;
}

export const AttendanceEventSchema =
  SchemaFactory.createForClass(AttendanceEvent);

AttendanceEventSchema.index({ userId: 1, scannedAt: -1 });
AttendanceEventSchema.index({ branchId: 1 });
