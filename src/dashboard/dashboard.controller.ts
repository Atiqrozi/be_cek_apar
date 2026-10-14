import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { InspectionsService } from '../inspections/inspections.service';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly inspections: InspectionsService) {}
  @Get('summary') @UseGuards(AuthGuard('jwt')) summary() { return this.inspections.summary(); }
}
