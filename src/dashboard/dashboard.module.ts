import { Module } from '@nestjs/common';
import { InspectionsModule } from '../inspections/inspections.module';
import { DashboardController } from './dashboard.controller';

@Module({ imports: [InspectionsModule], controllers: [DashboardController] })
export class DashboardModule {}
