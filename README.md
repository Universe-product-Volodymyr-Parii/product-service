Start the application: create an `.env` file based on `.env.example`, then run `docker compose up` from the project root. Database migrations are applied automatically on startup.

SQS connection: use `host.docker.internal:4566` so `product-service` talks to LocalStack through the host.

Seed test data: `run DATABASE_URL=postgresql://postgres:postgres@localhost:5432/products npm run db:seed` from the project root.

Use Drizzle Studio: `run DATABASE_URL=postgresql://postgres:postgres@localhost:5432/products npm run db:studio` from the project root.
