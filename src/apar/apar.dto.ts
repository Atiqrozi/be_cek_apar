import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { OperationalStatus } from './apar.schema';
export class CreateAparDto {
  @ApiProperty() @IsString() code!: string;
  @ApiProperty() @IsString() type!: string;
  @ApiProperty() @IsString() brand!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() capacity?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() serialNumber?: string;
  @ApiProperty() @IsString() locationId!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() specificLocation?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() installedAt?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() serviceDueAt?: string;
  @ApiProperty({ required: false, default: 30 }) @IsOptional() @IsInt() @Min(1) inspectionIntervalDays?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}
export class UpdateAparDto extends PartialType(CreateAparDto) {}
export class UpdateAparStatusDto {
  @ApiProperty({ enum: OperationalStatus })
  @IsEnum(OperationalStatus)
  operationalStatus!: OperationalStatus;
}
