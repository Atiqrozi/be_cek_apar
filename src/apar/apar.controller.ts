import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../common/pagination.dto';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { Role } from '../users/user.schema';
import { AparService } from './apar.service';
import { CreateAparDto, UpdateAparDto, UpdateAparStatusDto } from './apar.dto';
@ApiTags('apar')
@Controller('apar')
export class AparController {
  constructor(private readonly service: AparService) {}
  @Get() findAll(@Query() query: PaginationDto, @Query('locationId') locationId?: string) { return this.service.findAll(query, locationId); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() @UseGuards(AuthGuard('jwt'), RolesGuard) @Roles(Role.ADMIN) create(@Body() dto: CreateAparDto) { return this.service.create(dto); }
  @Patch(':id') @UseGuards(AuthGuard('jwt'), RolesGuard) @Roles(Role.ADMIN) update(@Param('id') id: string, @Body() dto: UpdateAparDto) { return this.service.update(id, dto); }
  @Patch(':id/status') @UseGuards(AuthGuard('jwt'), RolesGuard) @Roles(Role.ADMIN) updateStatus(@Param('id') id: string, @Body() dto: UpdateAparStatusDto) { return this.service.updateStatus(id, dto); }
}
