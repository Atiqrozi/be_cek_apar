import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inspection } from '../inspections/inspection.schema';
import { AddEvidenceDto, CreateCorrectiveActionDto, UpdateCorrectiveActionDto } from './corrective-action.dto';
import { CorrectiveAction, CorrectiveActionPriority, CorrectiveActionStatus } from './corrective-action.schema';

@Injectable()
export class CorrectiveActionsService {
  constructor(
    @InjectModel(CorrectiveAction.name) private readonly model: Model<CorrectiveAction>,
    @InjectModel(Inspection.name) private readonly inspectionModel: Model<Inspection>,
  ) {}

  async create(dto: CreateCorrectiveActionDto) {
    const inspection = await this.inspectionModel.findById(dto.inspectionId).lean();
    if (!inspection) throw new NotFoundException('Pemeriksaan tidak ditemukan');
    if (new Date(dto.dueDate).getTime() < Date.now()) throw new BadRequestException('Tenggat harus di masa depan');
    return (await this.model.create({
      ...dto,
      aparId: inspection.aparId,
      inspectionReference: inspection.reference,
      aparSnapshot: inspection.aparSnapshot,
      dueDate: new Date(dto.dueDate),
    })).toObject();
  }

  findAll(status?: CorrectiveActionStatus, priority?: CorrectiveActionPriority) {
    return this.model.find({ ...(status ? { status } : {}), ...(priority ? { priority } : {}) }).sort({ dueDate: 1 }).lean();
  }

  async findOne(id: string) {
    const item = await this.model.findById(id).lean();
    if (!item) throw new NotFoundException('Tindak lanjut tidak ditemukan');
    return item;
  }

  async update(id: string, dto: UpdateCorrectiveActionDto) {
    if (dto.dueDate && new Date(dto.dueDate).getTime() < Date.now() && dto.status !== CorrectiveActionStatus.COMPLETED) {
      throw new BadRequestException('Tenggat harus di masa depan');
    }
    const changes: Record<string, unknown> = { ...dto };
    if (dto.dueDate) changes.dueDate = new Date(dto.dueDate);
    if (dto.status === CorrectiveActionStatus.COMPLETED) changes.completedAt = new Date();
    const item = await this.model.findByIdAndUpdate(id, changes, { new: true, runValidators: true }).lean();
    if (!item) throw new NotFoundException('Tindak lanjut tidak ditemukan');
    return item;
  }

  async updateStatus(id: string, status: CorrectiveActionStatus) {
    return this.update(id, { status });
  }

  async addEvidence(id: string, dto: AddEvidenceDto) {
    const item = await this.model.findByIdAndUpdate(id, { $push: { evidence: { ...dto, uploadedAt: new Date() } } }, { new: true }).lean();
    if (!item) throw new NotFoundException('Tindak lanjut tidak ditemukan');
    return item;
  }
}
