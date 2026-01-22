import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'API is healthy',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2026-01-23T00:00:00.000Z',
        uptime: 12345.67,
        database: 'connected',
        environment: 'production',
        version: '1.0.0'
      }
    }
  })
  async check() {
    return this.healthService.check();
  }

  @Get('database')
  @ApiOperation({ summary: 'Database health check' })
  @ApiResponse({ status: 200, description: 'Database connection status' })
  async checkDatabase() {
    return this.healthService.checkDatabase();
  }
}
