import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type AparDocument = HydratedDocument<Apar>;
export enum OperationalStatus { ACTIVE = 'active', INACTIVE = 'inactive', OUT_OF_SERVICE = 'out_of_service' }
@Schema({ timestamps: true, collection: 'apar_assets' })
export class Apar {
  @Prop({ required: true, unique: true, trim: true, index: true }) code!: string;
  @Prop({ required: true, trim: true }) type!: string;
  @Prop({ required: true, trim: true }) brand!: string;
  @Prop({ trim: true }) capacity?: string;
  @Prop({ trim: true }) serialNumber?: string;
  @Prop({ required: true, index: true }) locationId!: string;
  @Prop() specificLocation?: string;
  @Prop() installedAt?: Date;
  @Prop() serviceDueAt?: Date;
  @Prop({ min: 1, default: 30 }) inspectionIntervalDays!: number;
  @Prop({ enum: OperationalStatus, default: OperationalStatus.ACTIVE, index: true }) operationalStatus!: OperationalStatus;
  @Prop() photoUrl?: string;
  @Prop() notes?: string;
  @Prop({ default: true, index: true }) isActive!: boolean;
}
export const AparSchema = SchemaFactory.createForClass(Apar);
