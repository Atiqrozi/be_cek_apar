import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Apar, AparSchema } from '../apar/apar.schema';
import { InspectionSchedule, InspectionScheduleSchema } from './schedule.schema';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: InspectionSchedule.name, schema: InspectionScheduleSchema }, { name: Apar.name, schema: AparSchema }])],
  controllers: [SchedulesController],
  providers: [SchedulesService],
})
export class SchedulesModule {}
