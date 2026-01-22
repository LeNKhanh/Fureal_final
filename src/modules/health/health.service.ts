import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(
    private configService: ConfigService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async check() {
    const dbStatus = await this.checkDatabase();
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus.status,
      environment: this.configService.get('app.env'),
      version: '1.0.0',
    };
  }

  async checkDatabase() {
    try {
      await this.connection.query('SELECT 1');
      return {
        status: 'connected',
        message: 'Database connection is healthy',
      };
    } catch (error) {
      return {
        status: 'disconnected',
        message: 'Database connection failed',
        error: error.message,
      };
    }
  }
}
