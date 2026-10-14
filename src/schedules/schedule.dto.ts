import { PartialType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ScheduleStatus } from './schedule.schema';

export class CreateScheduleDto {
  @IsString() @MinLength(1) aparId!: string;
  @IsString() @MinLength(1) locationName!: string;
  @IsDateString() scheduledFor!: string;
  @IsOptional() @IsString() assignedTo?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {
  @IsOptional() @IsEnum(ScheduleStatus) status?: ScheduleStatus;
}
