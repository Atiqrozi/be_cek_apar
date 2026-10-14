import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type CorrectiveActionDocument = HydratedDocument<CorrectiveAction>;
export enum CorrectiveActionStatus { OPEN = 'open', IN_PROGRESS = 'in_progress', PENDING_VERIFICATION = 'pending_verification', COMPLETED = 'completed' }
export enum CorrectiveActionPriority { LOW = 'low', MEDIUM = 'medium', HIGH = 'high', CRITICAL = 'critical' }

@Schema({ timestamps: true, collection: 'corrective_actions' })
export class CorrectiveAction {
  @Prop({ required: true, index: true }) inspectionId!: string;
  @Prop({ required: true, index: true }) aparId!: string;
  @Prop({ required: true }) inspectionReference!: string;
  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  aparSnapshot!: Record<string, unknown>;
  @Prop({ required: true, trim: true }) title!: string;
  @Prop({ required: true, trim: true }) description!: string;
  @Prop({ required: true, enum: CorrectiveActionPriority, index: true }) priority!: CorrectiveActionPriority;
  @Prop({ enum: CorrectiveActionStatus, default: CorrectiveActionStatus.OPEN, index: true }) status!: CorrectiveActionStatus;
  @Prop({ trim: true }) assigneeId?: string;
  @Prop({ trim: true }) assigneeName?: string;
  @Prop({ required: true, index: true }) dueDate!: Date;
  @Prop() completedAt?: Date;
  @Prop({ type: [{ url: String, name: String, uploadedAt: Date }], default: [] }) evidence!: Array<{ url: string; name?: string; uploadedAt: Date }>;
}

export const CorrectiveActionSchema = SchemaFactory.createForClass(CorrectiveAction);
