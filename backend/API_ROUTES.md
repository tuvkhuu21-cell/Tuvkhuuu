# Backend API Routes Overview

## Base URL: `http://localhost:4000`

## Health Check
- `GET /health` - Check if backend is running

## Authentication Routes (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile (requires auth)

## Orders Routes (`/api/orders`)
- `GET /api/orders` - List orders (requires auth)
- `POST /api/orders` - Create new order (customer role required)
- `GET /api/orders/:id` - Get order by ID (requires auth)
- `GET /api/orders/:id/timeline` - Get order timeline (requires auth)
- `POST /api/orders/:id/assign` - Assign order to driver (manager/admin role)
- `POST /api/orders/:id/status` - Update order status (manager/admin role)

## Driver Routes (`/api/driver`) - Requires driver role
- `GET /api/driver/me` - Get driver profile
- `GET /api/driver/assigned-orders` - Get assigned orders
- `GET /api/driver/active-order` - Get currently active order
- `GET /api/driver/completed-orders` - Get completed orders
- `GET /api/driver/orders/:id` - Get specific order
- `GET /api/driver/available-orders` - Get available orders for pickup
- `POST /api/driver/available-orders/:id/accept` - Accept available order
- `POST /api/driver/orders/:id/accept` - Accept assigned order
- `POST /api/driver/orders/:id/reject` - Reject order
- `POST /api/driver/orders/:id/status` - Update order status
- `POST /api/driver/status` - Update driver availability
- `POST /api/driver/location` - Update driver location
- `GET /api/driver/all-active-orders` - Get all active orders

## Dashboard Routes (`/api/dashboard`) - Requires manager/admin role
- `GET /api/dashboard/summary` - Get dashboard summary
- `GET /api/dashboard/daily-stats` - Get daily statistics
- `GET /api/dashboard/delays` - Get delay information
- `GET /api/dashboard/active-deliveries` - Get active deliveries
- `GET /api/dashboard/payment-summary` - Get payment summary
- `GET /api/dashboard/driver-availability` - Get driver availability

## Tracking Routes (`/api/tracking`)
- (Routes defined, endpoints to be documented)

## Payments Routes (`/api/payments`)
- (Routes defined, endpoints to be documented)

## Admin Routes (`/api/admin`)
- (Routes defined, endpoints to be documented)

## Authentication
Most routes require JWT authentication. Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## User Roles
- `customer` - Can create and view their orders
- `driver` - Can manage assigned orders and update location
- `manager` - Can manage orders and view dashboard
- `admin` - Full system access

## Current Status
✅ Server running on http://localhost:4000
✅ All routes are properly configured
✅ Authentication system working
⚠️ Database connection needs Railway credentials
