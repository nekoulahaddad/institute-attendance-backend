import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ required: true })
  entityType: string; // user

  @Prop({ type: Types.ObjectId, required: true })
  entityId: Types.ObjectId;

  @Prop({ required: true })
  action: string; // REGISTERED / UPDATED / APPROVED / REJECTED

  @Prop({ type: Object })
  changes: any;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  performedBy: Types.ObjectId;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
