import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { Role } from '../users/user.schema';
import { AddEvidenceDto, CreateCorrectiveActionDto, UpdateCorrectiveActionDto } from './corrective-action.dto';
import { CorrectiveActionPriority, CorrectiveActionStatus } from './corrective-action.schema';
import { CorrectiveActionsService } from './corrective-actions.service';

@ApiTags('corrective-actions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('corrective-actions')
export class CorrectiveActionsController {
  constructor(private readonly service: CorrectiveActionsService) {}
  @Get() findAll(@Query('status') status?: CorrectiveActionStatus, @Query('priority') priority?: CorrectiveActionPriority) { return this.service.findAll(status, priority); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() @Roles(Role.ADMIN) create(@Body() dto: CreateCorrectiveActionDto) { return this.service.create(dto); }
  @Patch(':id') @Roles(Role.ADMIN) update(@Param('id') id: string, @Body() dto: UpdateCorrectiveActionDto) { return this.service.update(id, dto); }
  @Patch(':id/status') @Roles(Role.ADMIN) updateStatus(@Param('id') id: string, @Body('status') status: CorrectiveActionStatus) { return this.service.updateStatus(id, status); }
  @Post(':id/evidence') @Roles(Role.ADMIN) addEvidence(@Param('id') id: string, @Body() dto: AddEvidenceDto) { return this.service.addEvidence(id, dto); }
}
