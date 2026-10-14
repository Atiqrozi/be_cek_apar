import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Apar, AparSchema } from './apar.schema';
import { Inspection, InspectionSchema } from '../inspections/inspection.schema';
import { InspectionSchedule, InspectionScheduleSchema } from '../schedules/schedule.schema';
import { AparController } from './apar.controller';
import { AparService } from './apar.service';
@Module({
  imports: [MongooseModule.forFeature([
    { name: Apar.name, schema: AparSchema },
    { name: Inspection.name, schema: InspectionSchema },
    { name: InspectionSchedule.name, schema: InspectionScheduleSchema },
  ])],
  controllers: [AparController],
  providers: [AparService],
})
export class AparModule {}
