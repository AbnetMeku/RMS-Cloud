# RMS Cloud

Multi-tenant restaurant order management system built as a responsive PWA.

## Stack

- Next.js, React, TypeScript
- Tailwind CSS, shadcn-style UI components
- PostgreSQL, Prisma ORM
- Redis (sessions + realtime pub/sub)
- Docker Compose

## Quick Start (local)

```bash
cp .env.example .env
npm install
docker compose up -d postgres redis
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Docker (full stack)

```bash
docker compose up --build
```

App: `http://localhost:3333` · Postgres: `localhost:5444` · Redis: `6379`

After first boot, seed from host if needed:

```bash
npm run db:seed
```

## Demo Access

| Role | Method | Credential |
|------|--------|------------|
| Super Admin | username + password | `superadmin` / `password123` |
| Admin | username + password | `admin` / `password123` |
| Manager | username + password | `manager` / `password123` |
| Cashier | username + password | `cashier` / `password123` |
| Waiter | PIN (Cloud Bistro) | `1234` |
| Kitchen/KDS | PIN (Cloud Bistro) | `1234` |

## MVP Flow Test

1. Login as `superadmin` → create a tenant (optional; demo tenant exists)
2. Login as `admin` → users, tables, stations, menu
3. Login as `waiter` (PIN) → open table order, send items
4. Login as `kitchen` (PIN) → mark items ready on KDS
5. Waiter → close bill
6. Login as `cashier` → accept payment, print receipt
7. Login as `admin` → view sales report on dashboard

## Order Statuses

- **Order:** OPEN → CLOSED → PAID (or CANCELLED)
- **Order item:** PENDING → READY (or CANCELLED)

## Architecture

Modular monolith under `src/modules/` with strict `tenantId` scoping on all queries.

Realtime updates use Redis pub/sub + SSE (`/api/events`).

## Environment

See `.env.example` for `DATABASE_URL`, `REDIS_URL`, `SESSION_SECRET`, `NEXT_PUBLIC_APP_URL`.
