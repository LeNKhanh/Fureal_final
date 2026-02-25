import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express from 'express';

const server = express();

let app: any;

async function createApp() {
  if (!app) {
    app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
      { logger: ['error', 'warn', 'log'] },
    );

    // Global prefix - IMPORTANT for routing
    app.setGlobalPrefix('api');

    // Parse CORS_ORIGIN as a comma-separated list and echo only the matched
    // origin in the response header (browsers reject multiple values in one header).
    const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
      .split(',')
      .map((o: string) => o.trim())
      .filter(Boolean);

    app.enableCors({
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow server-to-server / curl (no Origin header) and listed origins
        if (!origin || corsOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type,Authorization,X-Requested-With,Accept',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    
    await app.init();
  }
  return app;
}

export default async (req, res) => {
  await createApp();
  return server(req, res);
};
