import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('status')
  @ApiOperation({ summary: 'Check if GA4 is configured' })
  getStatus() {
    return {
      configured: this.analyticsService.isConfigured,
      message: this.analyticsService.isConfigured
        ? 'GA4 Data API connected'
        : 'GA4 not configured — returning demo data',
    };
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get analytics overview metrics' })
  @ApiQuery({ name: 'startDate', required: false, example: '30daysAgo' })
  @ApiQuery({ name: 'endDate', required: false, example: 'today' })
  getOverview(
    @Query('startDate') startDate = '30daysAgo',
    @Query('endDate') endDate = 'today',
  ) {
    return this.analyticsService.getOverview(startDate, endDate);
  }

  @Get('timeseries')
  @ApiOperation({ summary: 'Get daily traffic time series' })
  @ApiQuery({ name: 'startDate', required: false, example: '30daysAgo' })
  @ApiQuery({ name: 'endDate', required: false, example: 'today' })
  getTimeSeries(
    @Query('startDate') startDate = '30daysAgo',
    @Query('endDate') endDate = 'today',
  ) {
    return this.analyticsService.getTimeSeries(startDate, endDate);
  }

  @Get('top-pages')
  @ApiOperation({ summary: 'Get top visited pages' })
  @ApiQuery({ name: 'startDate', required: false, example: '30daysAgo' })
  @ApiQuery({ name: 'endDate', required: false, example: 'today' })
  @ApiQuery({ name: 'limit', required: false, example: '10' })
  getTopPages(
    @Query('startDate') startDate = '30daysAgo',
    @Query('endDate') endDate = 'today',
    @Query('limit') limit = '10',
  ) {
    return this.analyticsService.getTopPages(startDate, endDate, parseInt(limit) || 10);
  }

  @Get('traffic-sources')
  @ApiOperation({ summary: 'Get traffic sources breakdown' })
  @ApiQuery({ name: 'startDate', required: false, example: '30daysAgo' })
  @ApiQuery({ name: 'endDate', required: false, example: 'today' })
  getTrafficSources(
    @Query('startDate') startDate = '30daysAgo',
    @Query('endDate') endDate = 'today',
  ) {
    return this.analyticsService.getTrafficSources(startDate, endDate);
  }

  @Get('devices')
  @ApiOperation({ summary: 'Get device category breakdown' })
  @ApiQuery({ name: 'startDate', required: false, example: '30daysAgo' })
  @ApiQuery({ name: 'endDate', required: false, example: 'today' })
  getDeviceBreakdown(
    @Query('startDate') startDate = '30daysAgo',
    @Query('endDate') endDate = 'today',
  ) {
    return this.analyticsService.getDeviceBreakdown(startDate, endDate);
  }

  @Get('countries')
  @ApiOperation({ summary: 'Get top countries by users' })
  @ApiQuery({ name: 'startDate', required: false, example: '30daysAgo' })
  @ApiQuery({ name: 'endDate', required: false, example: 'today' })
  getCountries(
    @Query('startDate') startDate = '30daysAgo',
    @Query('endDate') endDate = 'today',
  ) {
    return this.analyticsService.getCountries(startDate, endDate);
  }

  @Get('realtime')
  @ApiOperation({ summary: 'Get real-time active users (last 30 min)' })
  getRealtimeUsers() {
    return this.analyticsService.getRealtimeUsers();
  }

  @Get('events')
  @ApiOperation({ summary: 'Get top events by count' })
  @ApiQuery({ name: 'startDate', required: false, example: '30daysAgo' })
  @ApiQuery({ name: 'endDate', required: false, example: 'today' })
  getEvents(
    @Query('startDate') startDate = '30daysAgo',
    @Query('endDate') endDate = 'today',
  ) {
    return this.analyticsService.getEvents(startDate, endDate);
  }
}
