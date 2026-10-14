import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { InspectionCondition } from './inspection.schema';

export class InspectionAnswerDto {
  @IsString() @MinLength(1) questionId!: string;
  @IsString() @MinLength(1) question!: string;
  @IsString() @MinLength(1) category!: string;
  @IsEnum(['good', 'bad']) answer!: string;
  @IsOptional() @IsString() notes?: string;
}

export class CreateInspectionDto {
  @IsString() @MinLength(1) aparId!: string;
  @IsString() @MinLength(1) inspectorName!: string;
  @IsOptional() @IsString() inspectorEmployeeId?: string;
  @IsString() @MinLength(1) locationName!: string;
  @IsDateString() inspectedAt!: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => InspectionAnswerDto) answers!: InspectionAnswerDto[];
  @IsOptional() @IsEnum(InspectionCondition) overallCondition?: InspectionCondition;
  @IsOptional() @IsString() notes?: string;
}
