import { Injectable } from "@nestjs/common";
import { and, asc, eq, gt, isNull } from "drizzle-orm";

import { DrizzleClient } from "@infra/db/drizzle.provider";
import { product } from "@infra/db/product.schema";

import { type CreateProduct, type CursorPagination } from "./product.validation";

@Injectable()
export class ProductRepository {
  public constructor(private readonly drizzle: DrizzleClient) {}

  async create(payload: CreateProduct) {
    const [createdProduct] = await this.drizzle.db
      .insert(product)
      .values({
        description: payload.description,
        name: payload.name,
        price: payload.price.toString(),
      })
      .returning();

    return createdProduct;
  }

  async getByCursor({ cursor, limit }: CursorPagination) {
    const productCondition = cursor ? gt(product.id, cursor) : undefined;
    const items = await this.drizzle.db
      .select()
      .from(product)
      .where(and(isNull(product.deletedAt), productCondition))
      .orderBy(asc(product.id))
      .limit(limit + 1);

    const hasNextPage = items.length > limit;
    const data = hasNextPage ? items.slice(0, limit) : items;
    const nextCursor = hasNextPage ? (data.at(-1)?.id ?? null) : null;

    return {
      data,
      pagination: {
        cursor,
        hasNextPage,
        limit,
        nextCursor,
      },
    };
  }

  async delete(productId: number): Promise<boolean> {
    const [deletedProduct] = await this.drizzle.db
      .update(product)
      .set({ deletedAt: new Date() })
      .where(and(eq(product.id, productId), isNull(product.deletedAt)))
      .returning({ id: product.id });

    return Boolean(deletedProduct);
  }
}
