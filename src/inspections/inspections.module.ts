import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Apar, AparSchema } from '../apar/apar.schema';
import { Inspection, InspectionSchema } from './inspection.schema';
import { InspectionsController } from './inspections.controller';
import { InspectionsService } from './inspections.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Inspection.name, schema: InspectionSchema }, { name: Apar.name, schema: AparSchema }])],
  controllers: [InspectionsController],
  providers: [InspectionsService],
  exports: [InspectionsService],
})
export class InspectionsModule {}
