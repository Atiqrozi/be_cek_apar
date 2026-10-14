import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;
export enum Role {
  ADMIN = 'admin',
  INSPECTOR = 'inspector',
  VIEWER = 'viewer',
}

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, trim: true })
  fullName!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, unique: true, trim: true })
  employeeId!: string;

  @Prop({ required: true, enum: Role, default: Role.VIEWER })
  role!: Role;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ default: true, index: true })
  isActive!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
