# Fureal E-commerce REST API

Professional e-commerce backend built with NestJS, PostgreSQL, TypeORM, and JWT authentication.

## Features

- 🔐 JWT Authentication with API Key support
- 👥 Role-based Access Control (ADMIN, MANAGER, USER)
- 🛒 Complete E-commerce functionality
- 📦 Product Management with Categories
- 🛍️ Shopping Cart & Order Processing
- 💳 Payment Integration
- 📝 Audit Logs & Order History
- 📚 Swagger API Documentation
- 🐳 Docker Ready for Deployment

## Tech Stack

- **Framework**: NestJS 10
- **Database**: PostgreSQL 17
- **ORM**: TypeORM
- **Authentication**: JWT + Passport
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Language**: TypeScript

## Project Structure

```
src/
├── common/              # Shared utilities, guards, decorators, filters
├── config/              # Configuration modules
├── modules/             # Feature modules
│   ├── auth/           # Authentication & authorization
│   ├── users/          # User management
│   ├── roles/          # Role management
│   ├── category-groups/ # Category group management
│   ├── categories/     # Category management
│   ├── products/       # Product management
│   ├── product-images/ # Product image management
│   ├── carts/          # Shopping cart
│   ├── cart-items/     # Cart items
│   ├── orders/         # Order management
│   ├── order-items/    # Order items
│   ├── payments/       # Payment processing
│   ├── addresses/      # User addresses
│   ├── inventory-logs/ # Inventory tracking
│   ├── audit-logs/     # Audit logging
│   └── order-status-history/ # Order status tracking
├── app.module.ts       # Root module
└── main.ts             # Application entry point
```

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your database credentials
```

## Environment Variables

Required environment variables (see `.env.example`):

- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port
- `DATABASE_*`: PostgreSQL connection details
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRES_IN`: Token expiration time
- `API_KEY`: API key for protected endpoints

## Running the Application

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod

# Docker
docker-compose up -d
```

## API Documentation

Once the application is running, access the Swagger documentation at:

```
http://localhost:3000/api/docs
```

## Database Setup

The database schema is already defined. Run migrations if needed:

```bash
npm run migration:run
```

## Default Roles

The system has 3 roles:
- **ADMIN**: Full system access
- **MANAGER**: Product and order management
- **USER**: Browse products, create orders (requires login)

## Authentication

### Register
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

### Login
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Protected Endpoints
Include JWT token in header:
```
Authorization: Bearer <token>
```

Or use API Key:
```
X-API-KEY: <your-api-key>
```

## User Flow

1. **Unauthenticated users**: Can browse products and categories
2. **Registration required**: Users must register/login to add items to cart
3. **Purchase requires authentication**: Must be logged in to create orders
4. **Admin/Manager**: Additional privileges for management operations

## Deployment

### Using Docker

```bash
docker-compose up -d
```

### Manual Deployment

1. Build the application: `npm run build`
2. Set environment variables
3. Run migrations: `npm run migration:run`
4. Start the server: `npm run start:prod`

## License

MIT
