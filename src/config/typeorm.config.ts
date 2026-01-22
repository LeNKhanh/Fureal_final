import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

const host = process.env.DATABASE_HOST || 'localhost';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host,
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USER || process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'fureal_ecommerce',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  // SSL required for all non-localhost connections (cloud databases)
  ssl: host !== 'localhost' && host !== '127.0.0.1'
    ? { rejectUnauthorized: false } 
    : false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
