import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { CreateInspectionDto } from './inspection.dto';
import { InspectionsService } from './inspections.service';

@ApiTags('inspections')
@Controller('inspections')
export class InspectionsController {
  constructor(private readonly service: InspectionsService) {}
  @Post() create(@Body() dto: CreateInspectionDto) { return this.service.create(dto); }
  @Get() @UseGuards(AuthGuard('jwt')) findAll(@Query('page') page?: string, @Query('limit') limit?: string, @Query('search') search?: string) {
    return this.service.findAll(Number(page) || 1, Math.min(Number(limit) || 20, 100), search);
  }
  @Get('by-apar/:aparId') @UseGuards(AuthGuard('jwt')) findByApar(@Param('aparId') aparId: string) { return this.service.findByApar(aparId); }
  @Get('by-user/:userId') @UseGuards(AuthGuard('jwt')) findByUser(@Param('userId') userId: string) { return this.service.findByUser(userId); }
  @Get(':id') @UseGuards(AuthGuard('jwt')) findOne(@Param('id') id: string) { return this.service.findOne(id); }
}
