Start the application: create an `.env` file based on `.env.example`, then run `docker compose up` from the project root. Database migrations are applied automatically on startup.

Use Drizzle Studio: `run DATABASE_URL=change_me npm run db:studio` from the project root. If PostgreSQL is exposed in docker-compose.yml, use a host-accessible connection string such as `postgresql://postgres:postgres@localhost:5432/products`.
