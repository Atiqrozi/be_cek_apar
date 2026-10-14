import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiTags } from '@nestjs/swagger';
import { Connection } from 'mongoose';
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}
  @Get()
  check() { return { status: 'ok', service: 'apar-check-api', timestamp: new Date().toISOString() }; }
  @Get('ready')
  ready() { return { status: this.connection.readyState === 1 ? 'ready' : 'not_ready' }; }
}
