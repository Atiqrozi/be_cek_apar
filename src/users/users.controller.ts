import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { PaginationDto } from '../common/pagination.dto';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { Role } from './user.schema';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}
  @Post() create(@Body() dto: CreateUserDto) { return this.service.create(dto); }
  @Get() findAll(@Query() query: PaginationDto) { return this.service.findAll(query); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findPublicById(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateUserDto) { return this.service.update(id, dto); }
}
