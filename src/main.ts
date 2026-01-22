import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: configService.get('cors.origin'),
    credentials: true,
  });

  // Validation pipe
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

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Fureal E-commerce API')
    .setDescription(
      `
      Professional E-commerce REST API built with NestJS
      
      ## Features
      -  JWT Authentication
      -  Role-based Access Control (ADMIN, MANAGER, USER)
      -  Shopping Cart & Orders
      -  Product Management
      -  Payment Processing
      
      ## Authentication
      Most endpoints require authentication. Use the /auth/login endpoint to get a JWT token,
      then click "Authorize" button and enter: Bearer <your-token>
      
      ## User Roles
      - **ADMIN**: Full system access
      - **MANAGER**: Product and order management
      - **USER**: Browse products, manage cart, create orders (requires login)
      
      ## Important Notes
      - Users must be logged in to add items to cart
      - Users must be logged in to create orders
      - Some endpoints require specific roles (indicated in endpoint description)
    `,
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-API-KEY', in: 'header' }, 'api-key')
    .addTag('Authentication', 'User registration and login')
    .addTag('Users', 'User management (Admin only)')
    .addTag('Roles', 'Role information')
    .addTag('Category Groups', 'Category group management')
    .addTag('Categories', 'Product categories')
    .addTag('Products', 'Product catalog')
    .addTag('Shopping Cart', 'Shopping cart operations (requires login)')
    .addTag('Orders', 'Order management (requires login)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Fureal E-commerce API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  const port = configService.get('app.port');
  
  // Only listen on port for local development
  if (process.env.NODE_ENV !== 'production') {
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}/api`);
    logger.log(`API Documentation: http://localhost:${port}/api/docs`);
    logger.log(`Environment: ${configService.get('app.env')}`);
  } else {
    await app.init();
    logger.log(`Application initialized for serverless deployment`);
    logger.log(`Environment: ${configService.get('app.env')}`);
  }
  
  return app;
}

// Serverless handler for Vercel
let cachedApp;

async function getApp() {
  if (!cachedApp) {
    cachedApp = await bootstrap();
  }
  return cachedApp;
}

export default async function handler(req, res) {
  const app = await getApp();
  const expressApp = app.getHttpAdapter().getInstance();
  return expressApp(req, res);
}

// For local development
if (require.main === module) {
  bootstrap();
}
