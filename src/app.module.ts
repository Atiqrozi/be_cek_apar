import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AparModule } from './apar/apar.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { LocationsModule } from './locations/locations.module';
import { UsersModule } from './users/users.module';
import { InspectionsModule } from './inspections/inspections.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SchedulesModule } from './schedules/schedules.module';
import { CorrectiveActionsModule } from './corrective-actions/corrective-actions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    AuthModule,
    UsersModule,
    LocationsModule,
    AparModule,
    HealthModule,
    InspectionsModule,
    DashboardModule,
    SchedulesModule,
    CorrectiveActionsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
