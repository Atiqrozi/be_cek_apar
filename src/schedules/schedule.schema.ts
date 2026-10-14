import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type ScheduleDocument = HydratedDocument<InspectionSchedule>;
export enum ScheduleStatus { SCHEDULED = 'scheduled', DUE_SOON = 'due_soon', OVERDUE = 'overdue', COMPLETED = 'completed' }

@Schema({ timestamps: true, collection: 'inspection_schedules' })
export class InspectionSchedule {
  @Prop({ required: true, index: true }) aparId!: string;
  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  aparSnapshot!: Record<string, unknown>;
  @Prop({ required: true }) locationName!: string;
  @Prop({ required: true, index: true }) scheduledFor!: Date;
  @Prop({ trim: true }) assignedTo?: string;
  @Prop({ trim: true }) notes?: string;
  @Prop({ enum: ScheduleStatus, default: ScheduleStatus.SCHEDULED, index: true }) status!: ScheduleStatus;
  @Prop() completedAt?: Date;
  @Prop() inspectionId?: string;
}

export const InspectionScheduleSchema = SchemaFactory.createForClass(InspectionSchedule);
InspectionScheduleSchema.index({ scheduledFor: 1, status: 1 });
