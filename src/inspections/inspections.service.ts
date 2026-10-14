import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Apar } from '../apar/apar.schema';
import { CreateInspectionDto } from './inspection.dto';
import { Inspection, InspectionCondition, InspectionStatus } from './inspection.schema';

@Injectable()
export class InspectionsService {
  constructor(
    @InjectModel(Inspection.name) private readonly model: Model<Inspection>,
    @InjectModel(Apar.name) private readonly aparModel: Model<Apar>,
  ) {}

  private calculateCondition(dto: CreateInspectionDto) {
    if (dto.answers.some(answer => answer.answer === 'bad')) return InspectionCondition.NEEDS_REPAIR;
    return InspectionCondition.GOOD;
  }

  async create(dto: CreateInspectionDto) {
    const apar = await this.aparModel.findOne({ _id: dto.aparId, isActive: true }).lean();
    if (!apar) throw new NotFoundException('APAR tidak ditemukan atau tidak aktif');
    if (!dto.answers.length) throw new BadRequestException('Jawaban checklist wajib diisi');
    const condition = this.calculateCondition(dto);
    const count = await this.model.countDocuments();
    const reference = `INS-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
    const created = await this.model.create({
      ...dto,
      reference,
      aparId: dto.aparId,
      aparSnapshot: { code: apar.code, type: apar.type, brand: apar.brand, capacity: apar.capacity, locationId: apar.locationId },
      inspectedAt: new Date(dto.inspectedAt),
      overallCondition: condition,
      status: InspectionStatus.SUBMITTED,
      submittedAt: new Date(),
    });
    await this.aparModel.findByIdAndUpdate(dto.aparId, { notes: dto.notes });
    return created.toObject();
  }

  async findAll(page = 1, limit = 20, search?: string) {
    const filter = search ? { $or: [{ reference: new RegExp(search, 'i') }, { inspectorName: new RegExp(search, 'i') }, { 'aparSnapshot.code': new RegExp(search, 'i') }] } : {};
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.model.find(filter).sort({ inspectedAt: -1 }).skip(skip).limit(limit).lean(),
      this.model.countDocuments(filter),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const item = await this.model.findById(id).lean();
    if (!item) throw new NotFoundException('Pemeriksaan tidak ditemukan');
    return item;
  }

  findByApar(aparId: string) { return this.model.find({ aparId }).sort({ inspectedAt: -1 }).lean(); }
  findByUser(inspectorName: string) { return this.model.find({ inspectorName }).sort({ inspectedAt: -1 }).lean(); }

  async summary() {
    const [totalApar, inspections, conditions, recent] = await Promise.all([
      this.aparModel.countDocuments({ isActive: true }),
      this.model.countDocuments({ status: InspectionStatus.SUBMITTED }),
      this.model.aggregate([{ $match: { status: InspectionStatus.SUBMITTED } }, { $group: { _id: '$overallCondition', count: { $sum: 1 } } }]),
      this.model.find({ status: InspectionStatus.SUBMITTED }).sort({ inspectedAt: -1 }).limit(5).lean(),
    ]);
    const distribution = Object.fromEntries(conditions.map(item => [item._id, item.count]));
    return { totalApar, totalInspections: inspections, conditionDistribution: distribution, recentInspections: recent };
  }
}
