# Umbrela Full-Stack Delivery Tracking System

Production-style demo delivery platform built on:
- **Frontend:** React + Vite + Tailwind (existing style preserved)
- **Backend:** Node.js + Express + Prisma
- **Database:** **MySQL only**
- **Realtime:** SSE (Server-Sent Events)
- **Auth:** JWT access + refresh tokens (refresh token stored hashed)

## 1) Project Structure

```text
umbrela/
  frontend/
    src/
      components/
        app/                  # new flow pages (order, checkout, tracking, driver, manager)
        auth/
        dashboards/
        pages/
      context/AuthContext.jsx
      lib/api.js
      lib/sse.js
  backend/
    prisma/
      schema.prisma
      migrations/0001_init/migration.sql
      seed.js
    src/
      app.js
      server.js
      config/
      db/
      middleware/
      routes/
      services/
      utils/
      modules/
        auth/
        orders/
        drivers/
        tracking/
        dashboard/
        payments/
```

## 2) Prerequisites

- Node.js 20+
- MySQL 8+
- npm

## 3) Environment Setup

### Backend

Copy and edit:

```bash
cp backend/.env.example backend/.env
```

Use your provided connection string in `.env`:

```env
DATABASE_URL="mysql://root:NIGHTfuy@99@localhost:3306/deliverysystem2"
```

Other important env vars:
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `ACCESS_TOKEN_TTL`
- `REFRESH_TOKEN_TTL`
- `AUTO_ASSIGN_RADIUS_METERS`
- `LOCATION_UPDATE_MIN_SECONDS`
- `LOCATION_UPDATE_MIN_DISTANCE_METERS`
- `PAYMENT_PROVIDER`
- `PAYMENT_SUCCESS_RATE_FOR_MOCK`
- `CURRENCY`

### Frontend

```bash
cp frontend/.env.example frontend/.env
```

Default:

```env
VITE_API_URL=http://localhost:4000/api
```

## 4) Install

### Backend

```bash
npm install --prefix backend
```

### Frontend

```bash
npm install --prefix frontend
```

## 5) Database Setup (MySQL + Prisma)

From `backend/`:

```bash
npx prisma generate
npx prisma migrate dev
node prisma/seed.js
```

> If `prisma migrate dev` is not used in your environment, apply `prisma/migrations/0001_init/migration.sql` manually and run `npx prisma generate`.

## 6) Run

### Start Backend

```bash
npm run dev --prefix backend
```

### Start Frontend

```bash
npm run dev --prefix frontend
```

## 7) Sample Accounts (seed)

Password for all: `password123`

- customer@demo.com (customer)
- driver@demo.com (driver)
- manager@demo.com (manager)
- admin@demo.com (admin)

## 8) API Overview

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Orders
- `POST /api/orders`
- `GET /api/orders/:id`
- `GET /api/orders/:id/timeline`
- `POST /api/orders/:id/assign`
- `POST /api/orders/:id/status`

### Driver
- `GET /api/driver/assigned-orders`
- `POST /api/driver/orders/:id/accept`
- `POST /api/driver/orders/:id/status`
- `POST /api/driver/location`

### Tracking
- `GET /api/tracking/:orderId`
- `GET /api/tracking/:orderId/stream`

### Payments
- `POST /api/payments/create-intent`
- `POST /api/payments/confirm`
- `POST /api/payments/webhook`
- `GET /api/payments/:orderId`
- `GET /api/payments/history/:orderId`
- `POST /api/payments/:orderId/mark-cod`
- `POST /api/payments/:orderId/refund`

### Dashboard
- `GET /api/dashboard/summary`
- `GET /api/dashboard/daily-stats`
- `GET /api/dashboard/delays`
- `GET /api/dashboard/active-deliveries`
- `GET /api/dashboard/payment-summary`

## 9) SSE Realtime Tracking

- Driver sends location updates to `POST /api/driver/location`
- Backend updates `drivers` + `driver_locations`
- Backend pushes SSE events to `GET /api/tracking/:orderId/stream`
- Frontend subscribes via `frontend/src/lib/sse.js`

Event types:
- `tracking:update`
- `order:status`
- `payment:update`
- `heartbeat`

## 10) Nearest Driver Auto-Assignment (MySQL)

Implemented in `orders.service.js`:
1. Filter available drivers with non-null coordinates
2. Bounding-box prefilter
3. SQL Haversine distance computation
4. Sort by nearest
5. Assign within `AUTO_ASSIGN_RADIUS_METERS`

If no driver is in radius, order stays unassigned for manual assignment.

## 11) Event Sourcing Model

`orders` is the read model (current state), `order_events` is append-only history.

Captured events include:
- `ORDER_CREATED`
- `DRIVER_ASSIGNED`
- `DRIVER_ACCEPTED`
- `PICKED_UP`
- `ON_THE_WAY`
- `DELIVERED`
- `PAYMENT_CREATED`
- `PAYMENT_PENDING`
- `PAYMENT_PAID`
- `PAYMENT_FAILED`
- `PAYMENT_REFUNDED`
- `NOTIFICATION_TRIGGERED`
- `NOTIFICATION_SENT`
- `NOTIFICATION_FAILED`

Timeline endpoint for UI:
- `GET /api/orders/:id/timeline`

## 12) Payment Flow

### Card (mock provider)
- Create order
- Create payment intent
- Confirm payment (mock success/failure)
- Update payment + order payment status

### Cash on Delivery
- Order uses `CashOnDelivery`
- Payment status remains COD until manager/admin marks paid

### Manual
- Supported in model and endpoint patterns for manager/admin workflows

## 13) Frontend Integration Notes

Kept existing visual language and component style.
New functional flow components:
- `CustomerOrderSection`
- `CustomerCheckoutSection`
- `CustomerTrackingSection`
- `DriverMobileSection`
- `ManagerAnalyticsSection`

New shared frontend modules:
- `src/lib/api.js` (token + refresh handling)
- `src/context/AuthContext.jsx`
- `src/lib/sse.js`

## 14) Architecture Summary

- Modular backend (auth/orders/drivers/tracking/dashboard/payments/notifications)
- Prisma schema maps exactly to MySQL tables + indexes
- JWT short-lived access token + DB-backed refresh token revocation
- SSE for customer live tracking
- Role + ownership checks enforced in services/middleware
- Notification abstraction isolated in service layer for future SMS/email providers
