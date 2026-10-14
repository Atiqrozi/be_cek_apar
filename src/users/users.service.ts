import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { Model } from 'mongoose';
import { PaginationDto } from '../common/pagination.dto';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly model: Model<User>) {}

  async create(dto: CreateUserDto) {
    try {
      const user = await this.model.create({
        ...dto,
        email: dto.email.toLowerCase(),
        passwordHash: await argon2.hash(dto.password),
      });
      return this.toPublic(user);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 11000) {
        throw new ConflictException('Email atau employee ID sudah digunakan');
      }
      throw error;
    }
  }

  async findAll(query: PaginationDto) {
    const filter = query.search
      ? { $or: [{ fullName: new RegExp(query.search, 'i') }, { email: new RegExp(query.search, 'i') }] }
      : {};
    const skip = (query.page - 1) * query.limit;
    const [data, total] = await Promise.all([
      this.model.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(query.limit).lean(),
      this.model.countDocuments(filter),
    ]);
    return { data, meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.model.findOne({ email: email.toLowerCase() }).exec();
  }

  async findPublicById(id: string) {
    const user = await this.model.findById(id).select('-passwordHash').lean();
    if (!user) throw new NotFoundException('Pengguna tidak ditemukan');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const changes: Record<string, unknown> = { ...dto };
    if (dto.password) {
      changes.passwordHash = await argon2.hash(dto.password);
      delete changes.password;
    }
    const user = await this.model.findByIdAndUpdate(id, changes, { new: true, runValidators: true }).select('-passwordHash').lean();
    if (!user) throw new NotFoundException('Pengguna tidak ditemukan');
    return user;
  }

  toPublic(user: UserDocument | User) {
    const value = 'toObject' in user ? user.toObject() : user;
    const { passwordHash: _passwordHash, ...publicUser } = value as User & { passwordHash?: string };
    return publicUser;
  }
}
