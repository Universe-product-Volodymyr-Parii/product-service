import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from "@nestjs/common";

import { ProductService } from "./product.service";
import { createProductSchema, cursorPaginationSchema } from "./product.validation";

@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() body: unknown) {
    const payload = createProductSchema.parse(body);
    return this.productService.create(payload);
  }

  @Get()
  async get(@Query() query: Record<string, unknown>) {
    const payload = cursorPaginationSchema.parse(query);
    return this.productService.getByCursor(payload);
  }

  @Delete(":id")
  async delete(@Param("id", ParseIntPipe) productId: number): Promise<void> {
    await this.productService.delete(productId);
  }
}
