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

    // Known production origins that should always be allowed
    const KNOWN_ORIGINS = [
      'https://www.fureal.store',
      'https://fureal.store',
      'https://fureal-fe.vercel.app',
    ];
    const envOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
      .split(',')
      .map((o: string) => o.trim())
      .filter(Boolean);
    const corsOrigins = [...new Set([...envOrigins, ...KNOWN_ORIGINS])];

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
