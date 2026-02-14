import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Device {
  @Prop({ required: true })
  deviceIdentifier: string;

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId;

  @Prop({ required: true })
  apiKeyHash: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

DeviceSchema.index({ deviceIdentifier: 1 });
