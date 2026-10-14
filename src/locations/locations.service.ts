import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateLocationDto, UpdateLocationDto } from './location.dto';
import { Location } from './location.schema';
@Injectable()
export class LocationsService {
  constructor(@InjectModel(Location.name) private readonly model: Model<Location>) {}
  async findAll() { return this.model.find({ isActive: true }).sort({ name: 1 }).lean(); }
  async findOne(id: string) { const item = await this.model.findById(id).lean(); if (!item) throw new NotFoundException('Lokasi tidak ditemukan'); return item; }
  async create(dto: CreateLocationDto) { try { return await this.model.create(dto); } catch (error) { if (error instanceof Error && 'code' in error && error.code === 11000) throw new ConflictException('Kode lokasi sudah digunakan'); throw error; } }
  async update(id: string, dto: UpdateLocationDto) { const item = await this.model.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).lean(); if (!item) throw new NotFoundException('Lokasi tidak ditemukan'); return item; }
  async deactivate(id: string) { const item = await this.model.findByIdAndUpdate(id, { isActive: false }, { new: true }).lean(); if (!item) throw new NotFoundException('Lokasi tidak ditemukan'); return item; }
}
