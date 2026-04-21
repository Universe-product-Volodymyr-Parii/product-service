import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  price: z.coerce.number().positive(),
});

export const cursorPaginationSchema = z.object({
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateProduct = z.infer<typeof createProductSchema>;
export type CursorPagination = z.infer<typeof cursorPaginationSchema>;
