import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationDto } from '../common/pagination.dto';
import { CreateAparDto, UpdateAparDto, UpdateAparStatusDto } from './apar.dto';
import { Apar } from './apar.schema';
import { Inspection, InspectionStatus } from '../inspections/inspection.schema';
import { InspectionSchedule, ScheduleStatus } from '../schedules/schedule.schema';

interface LatestInspection {
  aparId: string;
  inspectedAt: Date;
  inspectorName: string;
  overallCondition: string;
}
@Injectable()
export class AparService {
  constructor(
    @InjectModel(Apar.name) private readonly model: Model<Apar>,
    @InjectModel(Inspection.name) private readonly inspectionModel: Model<Inspection>,
    @InjectModel(InspectionSchedule.name) private readonly scheduleModel: Model<InspectionSchedule>,
  ) {}
  async create(dto: CreateAparDto) { try { return await this.model.create(dto); } catch (error) { if (error instanceof Error && 'code' in error && error.code === 11000) throw new ConflictException('Kode APAR sudah digunakan'); throw error; } }
  async findAll(query: PaginationDto, locationId?: string) {
    const filter = { isActive: true, ...(locationId ? { locationId } : {}), ...(query.search ? { $or: [{ code: new RegExp(query.search, 'i') }, { brand: new RegExp(query.search, 'i') }, { type: new RegExp(query.search, 'i') }] } : {}) };
    const skip = (query.page - 1) * query.limit;
    const [data, total] = await Promise.all([this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit).lean(), this.model.countDocuments(filter)]);
    const aparIds = data.map((apar) => String(apar._id));
    const inspections = await this.inspectionModel.aggregate<LatestInspection>([
      { $match: { aparId: { $in: aparIds }, status: InspectionStatus.SUBMITTED } },
      { $sort: { inspectedAt: -1 } },
      { $group: {
        _id: '$aparId',
        aparId: { $first: '$aparId' },
        inspectedAt: { $first: '$inspectedAt' },
        inspectorName: { $first: '$inspectorName' },
        overallCondition: { $first: '$overallCondition' },
      } },
    ]);
    const latestByApar = new Map<string, LatestInspection>();
    for (const inspection of inspections) {
      if (!latestByApar.has(inspection.aparId)) latestByApar.set(inspection.aparId, inspection);
    }
    const schedules = await this.scheduleModel.aggregate<{
      aparId: string;
      scheduledFor: Date;
    }>([
      {
        $match: {
          aparId: { $in: aparIds },
          status: { $in: [ScheduleStatus.SCHEDULED, ScheduleStatus.DUE_SOON, ScheduleStatus.OVERDUE] },
        },
      },
      { $sort: { scheduledFor: 1 } },
      { $group: { _id: '$aparId', aparId: { $first: '$aparId' }, scheduledFor: { $first: '$scheduledFor' } } },
    ]);
    const nextScheduleByApar = new Map(schedules.map((schedule) => [schedule.aparId, schedule]));
    const enrichedData = data.map((apar) => {
      const latest = latestByApar.get(String(apar._id));
      const nextSchedule = nextScheduleByApar.get(String(apar._id));
      return {
        ...apar,
        latestInspection: latest
          ? {
              inspectedAt: latest.inspectedAt,
              inspectorName: latest.inspectorName,
              overallCondition: latest.overallCondition,
            }
          : null,
        nextSchedule: nextSchedule ? { scheduledFor: nextSchedule.scheduledFor } : null,
      };
    });
    return { data: enrichedData, meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } };
  }
  async findOne(id: string) { const item = await this.model.findById(id).lean(); if (!item) throw new NotFoundException('APAR tidak ditemukan'); return item; }
  async update(id: string, dto: UpdateAparDto) { const item = await this.model.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).lean(); if (!item) throw new NotFoundException('APAR tidak ditemukan'); return item; }
  async updateStatus(id: string, dto: UpdateAparStatusDto) {
    const item = await this.model.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).lean();
    if (!item) throw new NotFoundException('APAR tidak ditemukan');
    return item;
  }
}
