import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type InspectionDocument = HydratedDocument<Inspection>;
export enum InspectionStatus { DRAFT = 'draft', SUBMITTED = 'submitted' }
export enum InspectionCondition { GOOD = 'good', NEEDS_REPAIR = 'needs_repair', DAMAGED = 'damaged' }

@Schema({ _id: false })
export class InspectionAnswer {
  @Prop({ required: true }) questionId!: string;
  @Prop({ required: true }) question!: string;
  @Prop({ required: true }) category!: string;
  @Prop({ required: true, enum: ['good', 'bad'] }) answer!: string;
  @Prop({ trim: true }) notes?: string;
}

@Schema({ timestamps: true, collection: 'inspections' })
export class Inspection {
  @Prop({ required: true, unique: true, index: true }) reference!: string;
  @Prop({ required: true, index: true }) aparId!: string;
  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  aparSnapshot!: Record<string, unknown>;
  @Prop({ required: true }) inspectorName!: string;
  @Prop({ trim: true }) inspectorEmployeeId?: string;
  @Prop({ required: true }) locationName!: string;
  @Prop({ required: true }) inspectedAt!: Date;
  @Prop({ type: [InspectionAnswer], default: [] }) answers!: InspectionAnswer[];
  @Prop({ required: true, enum: InspectionCondition }) overallCondition!: InspectionCondition;
  @Prop({ trim: true }) notes?: string;
  @Prop({ enum: InspectionStatus, default: InspectionStatus.SUBMITTED, index: true }) status!: InspectionStatus;
  @Prop() submittedAt?: Date;
}

export const InspectionAnswerSchema = SchemaFactory.createForClass(InspectionAnswer);
export const InspectionSchema = SchemaFactory.createForClass(Inspection);
