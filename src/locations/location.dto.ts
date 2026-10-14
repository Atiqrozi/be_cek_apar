import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
export class CreateLocationDto {
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsString() code!: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() parentId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
}
export class UpdateLocationDto extends PartialType(CreateLocationDto) {}
