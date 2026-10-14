import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Inspection, InspectionSchema } from '../inspections/inspection.schema';
import { CorrectiveAction, CorrectiveActionSchema } from './corrective-action.schema';
import { CorrectiveActionsController } from './corrective-actions.controller';
import { CorrectiveActionsService } from './corrective-actions.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: CorrectiveAction.name, schema: CorrectiveActionSchema }, { name: Inspection.name, schema: InspectionSchema }])],
  controllers: [CorrectiveActionsController],
  providers: [CorrectiveActionsService],
})
export class CorrectiveActionsModule {}
