import { Injectable, NotFoundException } from "@nestjs/common";

import { ProductRepository } from "./product.repository";
import { type CreateProduct, type CursorPagination } from "./product.validation";

@Injectable()
export class ProductService {
  public constructor(private readonly productRepository: ProductRepository) {}

  create(payload: CreateProduct) {
    return this.productRepository.create(payload);
  }

  getByCursor(payload: CursorPagination) {
    return this.productRepository.getByCursor(payload);
  }

  async delete(productId: number): Promise<void> {
    const deleted = await this.productRepository.delete(productId);

    if (!deleted) {
      throw new NotFoundException(`Product with id ${productId} was not found`);
    }
  }
}
