import { Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";

import { ProductService } from "./product.service";
import { createProductSchema, cursorPaginationSchema, deleteProductSchema } from "./product.validation";

@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() body: unknown) {
    const payload = await createProductSchema.parseAsync(body);
    return this.productService.create(payload);
  }

  @Get()
  async get(@Query() query: Record<string, unknown>) {
    const payload = await cursorPaginationSchema.parseAsync(query);
    return this.productService.getByCursor(payload);
  }

  @Delete(":id")
  async delete(@Param() params: Record<string, unknown>): Promise<{ message: string }> {
    const { id } = await deleteProductSchema.parseAsync(params);
    await this.productService.delete(id);
    return { message: `Product with id ${id} was deleted successfully` };
  }
}
