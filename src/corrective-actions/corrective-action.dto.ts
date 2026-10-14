import { PartialType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { CorrectiveActionPriority, CorrectiveActionStatus } from './corrective-action.schema';

export class CreateCorrectiveActionDto {
  @IsString() @MinLength(1) inspectionId!: string;
  @IsString() @MinLength(1) title!: string;
  @IsString() @MinLength(1) description!: string;
  @IsEnum(CorrectiveActionPriority) priority!: CorrectiveActionPriority;
  @IsDateString() dueDate!: string;
  @IsOptional() @IsString() assigneeId?: string;
  @IsOptional() @IsString() assigneeName?: string;
}

export class UpdateCorrectiveActionDto extends PartialType(CreateCorrectiveActionDto) {
  @IsOptional() @IsEnum(CorrectiveActionStatus) status?: CorrectiveActionStatus;
}

export class AddEvidenceDto {
  @IsString() @MinLength(1) url!: string;
  @IsOptional() @IsString() name?: string;
}
