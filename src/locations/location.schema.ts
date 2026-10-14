import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type LocationDocument = HydratedDocument<Location>;
@Schema({ timestamps: true, collection: 'locations' })
export class Location {
  @Prop({ required: true, trim: true }) name!: string;
  @Prop({ required: true, unique: true, trim: true }) code!: string;
  @Prop({ trim: true }) parentId?: string;
  @Prop() description?: string;
  @Prop({ default: true, index: true }) isActive!: boolean;
}
export const LocationSchema = SchemaFactory.createForClass(Location);
