import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  price: z.coerce.number().positive(),
});

export const cursorPaginationSchema = z.object({
  cursor: z.coerce.number().int().min(0).optional(),
  limit: z.coerce.number().int().min(0).max(100).default(10),
});

export const deleteProductSchema = z.object({
  id: z.coerce.number().int().min(1),
});

export type CreateProduct = z.infer<typeof createProductSchema>;
export type CursorPagination = z.infer<typeof cursorPaginationSchema>;
