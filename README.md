# EkonStat-API

[![Node.js >=20](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)

## Table of Contents

1. [Introduction](#introduction)
2. [Quick Start](#quick-start)
3. [Key Features](#key-features)
4. [Architecture](#architecture)
5. [Project Structure](#project-structure)
6. [Run Modes](#run-modes)
7. [Usage](#usage)
8. [API](#api)
9. [Environment Variables](#environment-variables)
10. [License](#license)

## Introduction

EkonStat API is a tool that consolidates public procurement data for Macedonia.
It provides:

- A modular HTTP API layer with shared infrastructure and validation
- Dedicated worker runtimes for scheduled ingestion and one-off backfills
- Event-driven webhook fanout when new data is processed
- Clear separation between transport, domain logic, and operational concerns

The stack is built around Hono, Drizzle ORM, PostgreSQL, and worker processes.

## Quick Start

Run with Docker (recommended):

1. Create local environment and secret files:

```bash
cp .env.example .env
mkdir -p secrets
openssl rand -base64 32 > secrets/database_password.txt
```

1. Start API + scheduler + bundled Postgres:

```bash
docker compose up -d --build app scheduler postgres
```

3. Verify:

```bash
curl http://localhost:8080/api/ping
curl http://localhost:8080/api/ready
```

Run locally (development):

```bash
npm ci
cp .env.example .env
npm run db:migrate
npm run dev:app
```

## Key Features

| Feature | Description |
| --- | --- |
| Modular architecture | Clear boundaries between infrastructure, shared utilities, and domain modules |
| Contract APIs | Cursor-based GET endpoints for procurement datasets |
| Input validation | Strong query/param validation with Zod and custom validator middleware |
| Production-safe middleware | CORS, secure headers, request IDs, rate limiting, and centralized error handling |
| Scheduler worker | Cron-based execution with queue-based concurrency control |
| Backfill worker | One-time batch ingestion mode for historical data |
| Webhook integration | Event-driven fanout with support for multiple endpoints per event type |
| Structured logging | Winston logger with console + file transports |

<details>
  <summary><strong>What this project is optimized for</strong></summary>

- Reliable ingestion and serving of procurement data
- API consumers that need stable pagination and filter support
- Automation workflows via outgoing webhooks

</details>

## Architecture

This project is designed as a modular service with three execution surfaces sharing the same core codebase.

```txt
Shared Core
  -> infrastructure/ (server, db, workers, webhooks, logging)
  -> shared/ (types, validation)
  -> modules/ (domain-specific routes, queries, scraping strategies)

Execution Surfaces
  -> API process (request/response)
  -> Scheduler worker (cron + event emission)
  -> Backfiller worker (bulk historical ingestion)

Scheduler Worker
  -> Cron jobs
  -> Module strategies
  -> Event bus
  -> Webhook dispatcher

Backfiller Worker
  -> Runs same module strategies in backfill mode
```

### Runtime processes

| Process | Entry point | Purpose |
| --- | --- | --- |
| API | src/app.ts | Serves /api endpoints |
| Scheduler | src/scheduler.worker.ts | Runs recurring jobs and webhook dispatch |
| Backfiller | src/backfiller.worker.ts | Executes one-time historical backfill |

## Project Structure

```txt
src/
  app.ts
  scheduler.worker.ts
  backfiller.worker.ts
  infrastructure/
    server/
    database/
    logging/
    webhooks/
    workers/
  modules/
    <module>/
      routes/
      data/
      scraping/
      jobs.ts
  shared/
    types/
    validation/
```

| Path | Responsibility |
| --- | --- |
| src/infrastructure/server | HTTP app setup, middleware stack, route registration, error handling |
| src/infrastructure/database | Drizzle ORM bootstrap, schema registry, and migrations |
| src/infrastructure/workers | Scheduler and backfiller orchestration |
| src/infrastructure/webhooks | Event bus wiring and outbound webhook dispatch |
| src/modules | Domain modules that encapsulate routes, queries, DTOs, and ingestion strategies |
| src/shared | Cross-module contracts such as types and validation schemas |

## Run Modes

### Prerequisites

- Node.js 20+
- PostgreSQL 16
- Docker and Docker Compose (recommended for production-like runs)

### Development Mode

Use this mode for active coding and hot-reload.

1. Install dependencies:

```bash
npm ci
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Set required values:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ekonstat-db
PORT=8080
```

4. Run migrations:

```bash
npm run db:migrate
```

5. Start each process in a separate terminal:

```bash
npm run dev:app
npm run dev:scheduler
npm run dev:backfiller
```

If you only want continuous API + scheduled ingestion, skip dev:backfiller.

### Production Mode (containerized)

Use this mode to run built artifacts inside containers.
The compose setup is Postgres-first: API and workers depend on the bundled `postgres` service and build `DATABASE_URL` internally from `POSTGRES_USER`, `POSTGRES_DB`, and the mounted password secret.

Run API + scheduler + database:

```bash
docker compose up -d --build app scheduler postgres
```

Optional one-off backfill run:

```bash
docker compose --profile backfill up --build backfiller
```

Check running services:

```bash
docker compose ps
```

API default URL:

- http://localhost:8080

## Usage

### Health checks

```bash
curl http://localhost:8080/api/ping
curl http://localhost:8080/api/ready
```

### Discover endpoints

```bash
curl http://localhost:8080/api/.well-known
```

### Fetch awarded contracts (paged)

```bash
curl "http://localhost:8080/api/contracts/awarded?pageSize=10&cursor=0"
```

### Fetch realised contracts for an institution

```bash
curl "http://localhost:8080/api/contracts/institutions/12/realised?pageSize=10&cursor=0"
```

## API

Base URL: /api

### Core endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | /api/ping | Liveness check |
| GET | /api/ready | Readiness check (verifies DB connectivity) |
| GET | /api/.well-known | Endpoint discovery payload |
| GET | /api/contracts/reference | Reference dictionaries for enum-like IDs |

### Contracts endpoints

| Method | Endpoint |
| --- | --- |
| GET | /api/contracts/awarded |
| GET | /api/contracts/awarded/:id |
| GET | /api/contracts/awarded/:id/changes |
| GET | /api/contracts/realised |
| GET | /api/contracts/realised/:id |
| GET | /api/contracts/institutions |
| GET | /api/contracts/institutions/:id |
| GET | /api/contracts/institutions/:id/awarded |
| GET | /api/contracts/institutions/:id/realised |

### Pagination contract

All list endpoints support:

| Query param | Type | Default | Notes |
| --- | --- | --- | --- |
| cursor | number | 0 | Forward cursor |
| pageSize | number | 10 | Min 1, max 100 |

Response envelope:

```json
{
  "data": [],
  "meta": {
    "nextCursor": 123,
    "pageSize": 10,
    "hasMore": true
  }
}
```

### Filtering

List endpoints support typed query filters in addition to pagination.
Use /api/contracts/reference to resolve supported enum-like identifiers.

## Environment Variables

| Variable | Required (Local Dev) | Description |
| --- | --- | --- |
| DATABASE_URL | Yes | PostgreSQL connection string used for local development mode. |
| PORT | No | API port (defaults to 8080) |
| REALISED_CONTRACTS_WEBHOOK_X | No | Webhook URLs for newly discovered realised contracts |
| AWARDED_CONTRACTS_WEBHOOK_X | No | Webhook URLs for newly discovered awarded contracts |
| CHANGES_IN_AWARDED_CONTRACTS_WEBHOOK_X | No | Webhook URLs for newly discovered contract changes |

When running with Docker Compose, service startup always builds a connection string from `POSTGRES_USER`, `POSTGRES_DB`, and the secret mounted at `/run/secrets/database_password`.

For local compose runs, ensure the secret file exists:

```bash
mkdir -p secrets
openssl rand -base64 32 > secrets/database_password.txt
```

Webhook variables are collected by prefix. You can register multiple endpoints by numbering with a trailing _X pattern (for example _1, _2, _3, . . . , _n).

```env
REALISED_CONTRACTS_WEBHOOK_1="https://example.com/hooks/realised-a"
REALISED_CONTRACTS_WEBHOOK_2="https://example.com/hooks/realised-b"
. . .
REALISED_CONTRACTS_WEBHOOK_N="https://example.com/hooks/realised-n"
```

If no variables with a given prefix are present, dispatch is skipped for that event.

Webhook payload shape:

```json
{
  "data": [],
  "meta": {
    "event": "event.name",
    "dispatchedAt": "2026-03-27T12:00:00.000Z"
  }
}
```

## License

This project is licensed under the MIT License.
