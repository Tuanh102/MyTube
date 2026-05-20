import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminDocument = Admin & Document;

@Schema({ timestamps: true })
export class Admin {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  name: string;

  @Prop()
  password?: string; // Cho đăng nhập truyền thống (nếu cần)

  @Prop()
  googleId?: string; // Cho đăng nhập Google

  @Prop({ default: 'ADMIN' }) // ADMIN, STAFF
  role: string;

  @Prop({ default: '/assets/img/default-admin-avatar.jpg' })
  avatar_url: string;

  @Prop({ default: 0 })
  balance: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
