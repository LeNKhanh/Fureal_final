import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export interface AnalyticsOverview {
  totalUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
}

export interface AnalyticsTimeSeries {
  date: string;
  users: number;
  sessions: number;
  pageViews: number;
}

export interface AnalyticsTopPage {
  path: string;
  title: string;
  views: number;
  users: number;
}

export interface AnalyticsTrafficSource {
  source: string;
  medium: string;
  sessions: number;
  users: number;
}

export interface AnalyticsDeviceBreakdown {
  device: string;
  sessions: number;
  percentage: number;
}

export interface AnalyticsCountry {
  country: string;
  users: number;
  sessions: number;
}

@Injectable()
export class AnalyticsService implements OnModuleInit {
  private readonly logger = new Logger(AnalyticsService.name);
  private client: BetaAnalyticsDataClient | null = null;
  private propertyId: string;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const credentialsJson = this.configService.get<string>('ga4.credentialsJson');
    this.propertyId = this.configService.get<string>('ga4.propertyId') || '';

    if (!credentialsJson || !this.propertyId) {
      this.logger.warn(
        'GA4 credentials or propertyId not configured. Analytics endpoints will return mock data.',
      );
      return;
    }

    try {
      const credentials = JSON.parse(credentialsJson);
      this.client = new BetaAnalyticsDataClient({ credentials });
      this.logger.log(`GA4 Data API client initialized for property ${this.propertyId}`);
    } catch (err) {
      this.logger.error('Failed to initialize GA4 client:', err.message);
    }
  }

  /** True when GA4 API is properly configured */
  get isConfigured(): boolean {
    return this.client !== null && !!this.propertyId;
  }

  // ────────────────────────────────────────
  //  PUBLIC API METHODS
  // ────────────────────────────────────────

  async getOverview(startDate: string, endDate: string): Promise<AnalyticsOverview> {
    if (!this.isConfigured) return this.mockOverview();

    const [response] = await this.client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'newUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
    });

    const row = response.rows?.[0];
    if (!row) return this.mockOverview();

    return {
      totalUsers: Number(row.metricValues[0]?.value || 0),
      newUsers: Number(row.metricValues[1]?.value || 0),
      sessions: Number(row.metricValues[2]?.value || 0),
      pageViews: Number(row.metricValues[3]?.value || 0),
      avgSessionDuration: Number(row.metricValues[4]?.value || 0),
      bounceRate: Number(row.metricValues[5]?.value || 0),
    };
  }

  async getTimeSeries(startDate: string, endDate: string): Promise<AnalyticsTimeSeries[]> {
    if (!this.isConfigured) return this.mockTimeSeries(startDate, endDate);

    const [response] = await this.client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
      ],
      orderBys: [{ dimension: { dimensionName: 'date', orderType: 'ALPHANUMERIC' } }],
    });

    return (response.rows || []).map((row) => ({
      date: row.dimensionValues[0]?.value || '',
      users: Number(row.metricValues[0]?.value || 0),
      sessions: Number(row.metricValues[1]?.value || 0),
      pageViews: Number(row.metricValues[2]?.value || 0),
    }));
  }

  async getTopPages(startDate: string, endDate: string, limit = 10): Promise<AnalyticsTopPage[]> {
    if (!this.isConfigured) return this.mockTopPages();

    const [response] = await this.client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'totalUsers' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit,
    });

    return (response.rows || []).map((row) => ({
      path: row.dimensionValues[0]?.value || '',
      title: row.dimensionValues[1]?.value || '',
      views: Number(row.metricValues[0]?.value || 0),
      users: Number(row.metricValues[1]?.value || 0),
    }));
  }

  async getTrafficSources(startDate: string, endDate: string): Promise<AnalyticsTrafficSource[]> {
    if (!this.isConfigured) return this.mockTrafficSources();

    const [response] = await this.client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    });

    return (response.rows || []).map((row) => ({
      source: row.dimensionValues[0]?.value || '(direct)',
      medium: row.dimensionValues[1]?.value || '(none)',
      sessions: Number(row.metricValues[0]?.value || 0),
      users: Number(row.metricValues[1]?.value || 0),
    }));
  }

  async getDeviceBreakdown(startDate: string, endDate: string): Promise<AnalyticsDeviceBreakdown[]> {
    if (!this.isConfigured) return this.mockDevices();

    const [response] = await this.client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'sessions' }],
    });

    const rows = response.rows || [];
    const total = rows.reduce((sum, r) => sum + Number(r.metricValues[0]?.value || 0), 0);

    return rows.map((row) => {
      const sessions = Number(row.metricValues[0]?.value || 0);
      return {
        device: row.dimensionValues[0]?.value || 'unknown',
        sessions,
        percentage: total > 0 ? Math.round((sessions / total) * 1000) / 10 : 0,
      };
    });
  }

  async getCountries(startDate: string, endDate: string): Promise<AnalyticsCountry[]> {
    if (!this.isConfigured) return this.mockCountries();

    const [response] = await this.client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'country' }],
      metrics: [{ name: 'totalUsers' }, { name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
      limit: 10,
    });

    return (response.rows || []).map((row) => ({
      country: row.dimensionValues[0]?.value || 'Unknown',
      users: Number(row.metricValues[0]?.value || 0),
      sessions: Number(row.metricValues[1]?.value || 0),
    }));
  }

  // ────────────────────────────────────────
  //  MOCK DATA (used when GA4 not yet configured)
  // ────────────────────────────────────────

  private mockOverview(): AnalyticsOverview {
    return {
      totalUsers: 1247,
      newUsers: 892,
      sessions: 2156,
      pageViews: 8432,
      avgSessionDuration: 185.4,
      bounceRate: 0.423,
    };
  }

  private mockTimeSeries(startDate: string, endDate: string): AnalyticsTimeSeries[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days: AnalyticsTimeSeries[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push({
        date: d.toISOString().slice(0, 10).replace(/-/g, ''),
        users: Math.floor(Math.random() * 80) + 20,
        sessions: Math.floor(Math.random() * 120) + 30,
        pageViews: Math.floor(Math.random() * 400) + 100,
      });
    }
    return days;
  }

  private mockTopPages(): AnalyticsTopPage[] {
    return [
      { path: '/', title: 'Fureal - Home', views: 2310, users: 1100 },
      { path: '/products', title: 'Products', views: 1580, users: 820 },
      { path: '/creativespace', title: 'Creative Space 3D', views: 980, users: 560 },
      { path: '/products/giuong-tang', title: 'Giường tầng trẻ em', views: 450, users: 320 },
      { path: '/about', title: 'About Us', views: 280, users: 210 },
    ];
  }

  private mockTrafficSources(): AnalyticsTrafficSource[] {
    return [
      { source: 'google', medium: 'organic', sessions: 890, users: 650 },
      { source: '(direct)', medium: '(none)', sessions: 560, users: 420 },
      { source: 'facebook', medium: 'social', sessions: 320, users: 240 },
      { source: 'zalo', medium: 'referral', sessions: 180, users: 140 },
    ];
  }

  private mockDevices(): AnalyticsDeviceBreakdown[] {
    return [
      { device: 'desktop', sessions: 1200, percentage: 55.7 },
      { device: 'mobile', sessions: 780, percentage: 36.2 },
      { device: 'tablet', sessions: 176, percentage: 8.1 },
    ];
  }

  private mockCountries(): AnalyticsCountry[] {
    return [
      { country: 'Vietnam', users: 980, sessions: 1650 },
      { country: 'United States', users: 120, sessions: 180 },
      { country: 'Japan', users: 65, sessions: 95 },
      { country: 'South Korea', users: 42, sessions: 58 },
    ];
  }
}
