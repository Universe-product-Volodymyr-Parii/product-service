import { z } from "zod";

export const envSchema = z.object({
  HOST: z.string().nonempty(),
  PORT: z.coerce.number().positive().max(65535),

  DATABASE_URL: z.url().nonempty(),
});
