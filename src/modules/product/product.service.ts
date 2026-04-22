import { Injectable, NotFoundException } from "@nestjs/common";

import { SqsService } from "@infra/sqs/sqs.service";

import { ProductRepository } from "./product.repository";
import { type CreateProduct, type CursorPagination } from "./product.validation";

@Injectable()
export class ProductService {
  public constructor(
    private readonly productRepository: ProductRepository,
    private readonly sqsService: SqsService,
  ) {}

  async create(payload: CreateProduct) {
    const createdProduct = await this.productRepository.create(payload);

    this.sqsService.publishProductCreated({
      id: createdProduct.id,
      name: createdProduct.name,
      price: createdProduct.price,
    });

    return createdProduct;
  }

  getByCursor(payload: CursorPagination) {
    return this.productRepository.getByCursor(payload);
  }

  async delete(productId: number): Promise<void> {
    const deleted = await this.productRepository.delete(productId);

    if (!deleted) {
      throw new NotFoundException(`Product with id ${productId} was not found`);
    }

    this.sqsService.publishProductDeleted({
      id: productId,
    });
  }
}
