# API Documentation - Fureal E-commerce

Base URL: `https://fureal-final.vercel.app/api`

## Table of Contents
- [Authentication](#authentication)
- [Users](#users)
- [Roles](#roles)
- [Products](#products)
- [Categories](#categories)
- [Category Groups](#category-groups)
- [Shopping Cart](#shopping-cart)
- [Orders](#orders)
- [Addresses](#addresses)
- [Audit Logs](#audit-logs)
- [Health Check](#health-check)

---

## Authentication

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "username"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Google OAuth Login
```http
GET /auth/google
```
Redirects to Google login page

### Google OAuth Callback
```http
GET /auth/google/callback
```
Handles Google callback and redirects to frontend with token

### Get Current User Profile
```http
GET /auth/profile
Authorization: Bearer {token}
```

---

## Users

### Get All Users (Admin only)
```http
GET /users
Authorization: Bearer {token}

Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- search: string (search by email, username)
- role: string (filter by role name)
```

### Get User by ID
```http
GET /users/:id
Authorization: Bearer {token}

Params:
- id: string (UUID)
```

### Create User (Admin only)
```http
POST /users
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "username": "newuser",
  "roleId": "uuid"
}
```

### Update User
```http
PATCH /users/:id
Authorization: Bearer {token}
Content-Type: application/json

Params:
- id: string (UUID)

Body:
{
  "email": "updated@example.com",
  "username": "updatedname",
  "roleId": "uuid"
}
```

### Delete User (Admin only)
```http
DELETE /users/:id
Authorization: Bearer {token}

Params:
- id: string (UUID)
```

---

## Roles

### Get All Roles
```http
GET /roles

Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
```

### Get Role by ID
```http
GET /roles/:id

Params:
- id: string (UUID)
```

### Create Role (Admin only)
```http
POST /roles
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "MANAGER",
  "description": "Manager role with specific permissions"
}
```

### Update Role (Admin only)
```http
PATCH /roles/:id
Authorization: Bearer {token}
Content-Type: application/json

Params:
- id: string (UUID)

Body:
{
  "name": "UPDATED_ROLE",
  "description": "Updated description"
}
```

### Delete Role (Admin only)
```http
DELETE /roles/:id
Authorization: Bearer {token}

Params:
- id: string (UUID)
```

---

## Products

### Get All Products
```http
GET /products

Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- search: string (search by name, description)
- categoryId: string (UUID - filter by category)
- minPrice: number
- maxPrice: number
- inStock: boolean
- sortBy: string (name, price, createdAt)
- sortOrder: string (ASC, DESC)
```

### Get Product by ID
```http
GET /products/:id

Params:
- id: string (UUID)
```

### Create Product (Admin/Manager)
```http
POST /products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "stockQuantity": 100,
  "categoryId": "uuid",
  "sku": "SKU-001",
  "images": [
    {
      "url": "https://example.com/image.jpg",
      "isPrimary": true
    }
  ]
}
```

### Update Product (Admin/Manager)
```http
PATCH /products/:id
Authorization: Bearer {token}
Content-Type: application/json

Params:
- id: string (UUID)

Body:
{
  "name": "Updated Product Name",
  "price": 89.99,
  "stockQuantity": 150
}
```

### Delete Product (Admin)
```http
DELETE /products/:id
Authorization: Bearer {token}

Params:
- id: string (UUID)
```

---

## Categories

### Get All Categories
```http
GET /categories

Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- search: string (search by name)
- categoryGroupId: string (UUID - filter by category group)
- isActive: boolean
```

### Get Category by ID
```http
GET /categories/:id

Params:
- id: string (UUID)
```

### Create Category (Admin/Manager)
```http
POST /categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Category Name",
  "description": "Category description",
  "categoryGroupId": "uuid",
  "isActive": true
}
```

### Update Category (Admin/Manager)
```http
PATCH /categories/:id
Authorization: Bearer {token}
Content-Type: application/json

Params:
- id: string (UUID)

Body:
{
  "name": "Updated Category",
  "isActive": false
}
```

### Delete Category (Admin)
```http
DELETE /categories/:id
Authorization: Bearer {token}

Params:
- id: string (UUID)
```

---

## Category Groups

### Get All Category Groups
```http
GET /category-groups

Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- search: string (search by name)
- isActive: boolean
```

### Get Category Group by ID
```http
GET /category-groups/:id

Params:
- id: string (UUID)
```

### Create Category Group (Admin/Manager)
```http
POST /category-groups
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "isActive": true
}
```

### Update Category Group (Admin/Manager)
```http
PATCH /category-groups/:id
Authorization: Bearer {token}
Content-Type: application/json

Params:
- id: string (UUID)

Body:
{
  "name": "Updated Group Name",
  "isActive": false
}
```

### Delete Category Group (Admin)
```http
DELETE /category-groups/:id
Authorization: Bearer {token}

Params:
- id: string (UUID)
```

---

## Shopping Cart

### Get Current User's Cart
```http
GET /carts
Authorization: Bearer {token}
```

### Add Item to Cart
```http
POST /carts/items
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "uuid",
  "quantity": 2
}
```

### Update Cart Item Quantity
```http
PATCH /carts/items/:itemId
Authorization: Bearer {token}
Content-Type: application/json

Params:
- itemId: string (UUID)

Body:
{
  "quantity": 3
}
```

### Remove Item from Cart
```http
DELETE /carts/items/:itemId
Authorization: Bearer {token}

Params:
- itemId: string (UUID)
```

### Clear Cart
```http
DELETE /carts/clear
Authorization: Bearer {token}
```

---

## Orders

### Get User's Orders
```http
GET /orders
Authorization: Bearer {token}

Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- status: string (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
- startDate: string (ISO date)
- endDate: string (ISO date)
- minTotal: number
- maxTotal: number
```

### Get All Orders (Admin/Manager)
```http
GET /orders/all
Authorization: Bearer {token}

Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- userId: string (UUID - filter by user)
- status: string
- startDate: string (ISO date)
- endDate: string (ISO date)
```

### Get Order by ID
```http
GET /orders/:id
Authorization: Bearer {token}

Params:
- id: string (UUID)
```

### Create Order from Cart
```http
POST /orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "addressId": "uuid",
  "paymentMethod": "CREDIT_CARD",
  "notes": "Please deliver after 5 PM"
}
```

### Update Order Status (Admin/Manager)
```http
PATCH /orders/:id/status
Authorization: Bearer {token}
Content-Type: application/json

Params:
- id: string (UUID)

Body:
{
  "status": "PROCESSING",
  "notes": "Order is being prepared"
}
```

### Cancel Order
```http
PATCH /orders/:id/cancel
Authorization: Bearer {token}

Params:
- id: string (UUID)

Body (optional):
{
  "reason": "Changed my mind"
}
```

---

## Addresses

### Get User's Addresses
```http
GET /addresses
Authorization: Bearer {token}

Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- isDefault: boolean
```

### Get Address by ID
```http
GET /addresses/:id
Authorization: Bearer {token}

Params:
- id: string (UUID)
```

### Create Address
```http
POST /addresses
Authorization: Bearer {token}
Content-Type: application/json

{
  "fullName": "John Doe",
  "phoneNumber": "+84901234567",
  "addressLine1": "123 Main Street",
  "addressLine2": "Apartment 4B",
  "city": "Ho Chi Minh City",
  "state": "Ho Chi Minh",
  "postalCode": "700000",
  "country": "Vietnam",
  "isDefault": true
}
```

### Update Address
```http
PATCH /addresses/:id
Authorization: Bearer {token}
Content-Type: application/json

Params:
- id: string (UUID)

Body:
{
  "fullName": "Jane Doe",
  "phoneNumber": "+84907654321",
  "isDefault": true
}
```

### Delete Address
```http
DELETE /addresses/:id
Authorization: Bearer {token}

Params:
- id: string (UUID)
```

### Set Default Address
```http
PATCH /addresses/:id/set-default
Authorization: Bearer {token}

Params:
- id: string (UUID)
```

---

## Audit Logs

### Get Audit Logs (Admin only)
```http
GET /audit-logs
Authorization: Bearer {token}

Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- userId: string (UUID - filter by user)
- action: string (CREATE, UPDATE, DELETE, LOGIN, LOGOUT)
- entityType: string (User, Product, Order, etc.)
- entityId: string (UUID)
- startDate: string (ISO date)
- endDate: string (ISO date)
```

### Get Audit Log by ID (Admin only)
```http
GET /audit-logs/:id
Authorization: Bearer {token}

Params:
- id: string (UUID)
```

---

## Health Check

### Basic Health Check
```http
GET /health

Response:
{
  "status": "ok",
  "timestamp": "2026-01-24T00:00:00.000Z",
  "uptime": 12345.67,
  "database": "connected",
  "environment": "production",
  "version": "1.0.0"
}
```

### Database Health Check
```http
GET /health/database

Response:
{
  "status": "connected",
  "message": "Database connection is healthy"
}
```

---

## Common Response Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User doesn't have permission
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

## Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email must be valid"
    }
  ],
  "timestamp": "2026-01-24T00:00:00.000Z",
  "path": "/api/auth/register"
}
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Pagination

Paginated endpoints return data in this format:

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Swagger Documentation

Interactive API documentation available at:
```
https://fureal-final.vercel.app/api/docs
```
