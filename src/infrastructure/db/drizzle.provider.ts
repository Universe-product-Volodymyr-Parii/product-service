import { join } from "node:path";

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

import { product } from "./product.schema";
const schema = { product };

@Injectable()
export class DrizzleClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DrizzleClient.name);
  private readonly pool: Pool;
  public db: NodePgDatabase<typeof schema>;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.db = drizzle(this.pool, { schema });
  }

  async onModuleInit(): Promise<void> {
    this.logger.log("Running database migrations");

    await migrate(this.db, {
      migrationsFolder: join(process.cwd(), "drizzle"),
    });

    this.logger.log("Database migrations completed");
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
