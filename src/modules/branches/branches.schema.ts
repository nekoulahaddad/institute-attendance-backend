import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Branch {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  code: string;

  @Prop()
  address: string;

  @Prop()
  phone: string;
}

export const BranchSchema = SchemaFactory.createForClass(Branch);
