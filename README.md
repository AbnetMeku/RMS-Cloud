# RMS Cloud

Multi-tenant restaurant order management system built as a responsive PWA.

## Stack

- Next.js, React, TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Redis
- Docker Compose

## Containers

- `app`: Next.js frontend and backend API
- `postgres`: PostgreSQL database
- `redis`: realtime/cache/session foundation

## Quick Start

```bash
cp .env.example .env
npm install
npm run prisma:generate
docker compose up -d postgres redis
npm run prisma:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Docker

```bash
docker compose up --build
```

After the app container is running, run migrations from your host or an app shell:

```bash
npm run prisma:migrate
npm run db:seed
```

## Demo Access

- Super Admin: `super@rms.local` / `password123`
- Admin: `admin@cloudbistro.local` / `password123`
- Waiter PIN: `1234`
- Kitchen PIN: `1234`
- Cashier: `cashier@cloudbistro.local` / `password123`

## MVP Scope In This Slice

- PostgreSQL schema for tenants, users, permissions, tables, menu, stations, orders, order items, payments, inventory, expenses, and reports.
- Seed data for one demo tenant.
- Responsive PWA shell with manifest and service worker.
- Role dashboards:
  - Super Admin tenant management
  - Admin/Manager operations
  - Waiter ordering
  - KDS preparation queue
  - Cashier payment queue
- Tenant-scoped Prisma service examples for order, KDS, cashier, and reporting flows.

## Order Statuses

Orders:

- `OPEN`
- `CLOSED`
- `PAID`
- `CANCELLED`

Order items:

- `PENDING`
- `READY`
- `CANCELLED`

## Next Implementation Steps

1. Add real authentication and session middleware.
2. Replace demo dashboard state with Prisma-backed server actions/API routes.
3. Add Socket.io server integration for KDS/waiter/cashier realtime events.
4. Add create/edit forms for tenant, users, tables, stations, menu, inventory, and expenses.
5. Add receipt print layout and payment validation.
