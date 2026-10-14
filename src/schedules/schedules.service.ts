import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Apar } from '../apar/apar.schema';
import { CreateScheduleDto, UpdateScheduleDto } from './schedule.dto';
import { InspectionSchedule, ScheduleStatus } from './schedule.schema';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectModel(InspectionSchedule.name) private readonly model: Model<InspectionSchedule>,
    @InjectModel(Apar.name) private readonly aparModel: Model<Apar>,
  ) {}

  private async withCurrentStatus(item: InspectionSchedule & { _id: unknown }) {
    if (item.status === ScheduleStatus.COMPLETED) return item;
    const scheduledFor = new Date(String(item.scheduledFor)).getTime();
    const now = Date.now();
    const dueSoon = now + 7 * 24 * 60 * 60 * 1000;
    const status = scheduledFor < now ? ScheduleStatus.OVERDUE : scheduledFor <= dueSoon ? ScheduleStatus.DUE_SOON : ScheduleStatus.SCHEDULED;
    if (status !== item.status) await this.model.updateOne({ _id: item._id }, { status });
    return { ...item, status };
  }

  async create(dto: CreateScheduleDto) {
    const apar = await this.aparModel.findOne({ _id: dto.aparId, isActive: true }).lean();
    if (!apar) throw new NotFoundException('APAR tidak ditemukan atau tidak aktif');
    const scheduledFor = new Date(dto.scheduledFor);
    if (scheduledFor.getTime() < Date.now()) throw new BadRequestException('Tanggal jadwal harus di masa depan');
    const created = await this.model.create({
      ...dto,
      scheduledFor,
      aparSnapshot: { code: apar.code, type: apar.type, capacity: apar.capacity },
    });
    return created.toObject();
  }

  async findAll(status?: ScheduleStatus, aparId?: string) {
    const filter = { ...(aparId ? { aparId } : {}) };
    const items = await this.model.find(filter).sort({ scheduledFor: 1 }).lean();
    const normalized = await Promise.all(items.map(item => this.withCurrentStatus(item)));
    return status ? normalized.filter(item => item.status === status) : normalized;
  }

  async findOverdue() {
    const items = await this.model.find({ status: { $ne: ScheduleStatus.COMPLETED }, scheduledFor: { $lt: new Date() } }).sort({ scheduledFor: 1 }).lean();
    return Promise.all(items.map(item => this.withCurrentStatus(item)));
  }

  async update(id: string, dto: UpdateScheduleDto) {
    const existing = await this.model.findById(id).lean();
    if (!existing) throw new NotFoundException('Jadwal tidak ditemukan');
    if (dto.scheduledFor && new Date(dto.scheduledFor).getTime() < Date.now() && dto.status !== ScheduleStatus.COMPLETED) {
      throw new BadRequestException('Tanggal jadwal harus di masa depan');
    }
    const changes: Record<string, unknown> = { ...dto };
    if (dto.scheduledFor) changes.scheduledFor = new Date(dto.scheduledFor);
    if (dto.status === ScheduleStatus.COMPLETED) changes.completedAt = new Date();
    const updated = await this.model.findByIdAndUpdate(id, changes, { new: true, runValidators: true }).lean();
    if (!updated) throw new NotFoundException('Jadwal tidak ditemukan');
    return this.withCurrentStatus(updated);
  }

  async findOne(id: string) {
    const item = await this.model.findById(id).lean();
    if (!item) throw new NotFoundException('Jadwal tidak ditemukan');
    return this.withCurrentStatus(item);
  }
}
