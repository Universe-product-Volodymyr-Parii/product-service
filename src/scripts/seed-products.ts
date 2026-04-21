import { faker } from "@faker-js/faker";
import { config } from "dotenv";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { product } from "@infra/db/product.schema";

config({ path: ".env" });

const SEED_COUNT = 100;

function generateSeedProducts() {
  return Array.from({ length: SEED_COUNT }, () => ({
    description: faker.commerce.productDescription(),
    name: faker.commerce.productName(),
    price: faker.commerce.price({ dec: 2, max: 2000, min: 0.01 }),
  }));
}

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);
  const seedProducts = generateSeedProducts();

  try {
    await db.execute(sql`TRUNCATE TABLE "product" RESTART IDENTITY CASCADE`);
    await db.insert(product).values(seedProducts);

    console.log(`Seeded ${seedProducts.length} products`);
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error("Failed to seed products", error);
  process.exitCode = 1;
});
