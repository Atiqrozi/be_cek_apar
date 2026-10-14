import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { Role } from '../users/user.schema';
import { CreateScheduleDto, UpdateScheduleDto } from './schedule.dto';
import { ScheduleStatus } from './schedule.schema';
import { SchedulesService } from './schedules.service';

@ApiTags('schedules')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly service: SchedulesService) {}
  @Get() findAll(@Query('status') status?: ScheduleStatus, @Query('aparId') aparId?: string) { return this.service.findAll(status, aparId); }
  @Get('overdue') overdue() { return this.service.findOverdue(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() @Roles(Role.ADMIN) create(@Body() dto: CreateScheduleDto) { return this.service.create(dto); }
  @Patch(':id') @Roles(Role.ADMIN) update(@Param('id') id: string, @Body() dto: UpdateScheduleDto) { return this.service.update(id, dto); }
}
