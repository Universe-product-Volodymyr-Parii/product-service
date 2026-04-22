## File includes:

- Product service
- PostgreSQL
- SQS publisher for product events

## Prerequisites

Requires Docker to be installed on local machine.

Requires LocalStack SQS to be running and reachable from Docker on `host.docker.internal:4566`.

## Installation

Create an `.env` file based on `.env.example`, then run:

```bash
$ docker compose up --build
```

## Description

This service manages products, stores data in PostgreSQL, applies database migrations on startup, and publishes create/delete product events to SQS.

Seed test data:

```bash
$ DATABASE_URL=postgresql://postgres:postgres@localhost:5432/products npm run db:seed
```

Use Drizzle Studio:

```bash
$ DATABASE_URL=postgresql://postgres:postgres@localhost:5432/products npm run db:studio
```
