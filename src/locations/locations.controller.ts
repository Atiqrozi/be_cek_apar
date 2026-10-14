import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { Role } from '../users/user.schema';
import { CreateLocationDto, UpdateLocationDto } from './location.dto';
import { LocationsService } from './locations.service';
@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly service: LocationsService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() @UseGuards(AuthGuard('jwt'), RolesGuard) @Roles(Role.ADMIN) create(@Body() dto: CreateLocationDto) { return this.service.create(dto); }
  @Patch(':id') @UseGuards(AuthGuard('jwt'), RolesGuard) @Roles(Role.ADMIN) update(@Param('id') id: string, @Body() dto: UpdateLocationDto) { return this.service.update(id, dto); }
  @Delete(':id') @UseGuards(AuthGuard('jwt'), RolesGuard) @Roles(Role.ADMIN) deactivate(@Param('id') id: string) { return this.service.deactivate(id); }
}
