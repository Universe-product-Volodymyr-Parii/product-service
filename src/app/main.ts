import { NestFactory } from "@nestjs/core";

import { ZodExceptionFilter } from "@lib/filters/zod-exception.filter";

import { AppModule } from "./app.module";
const { PORT = 8080, HOST = "0.0.0.0" } = process.env;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ZodExceptionFilter());
  await app.listen(PORT, HOST);
}
bootstrap().catch(console.error);
