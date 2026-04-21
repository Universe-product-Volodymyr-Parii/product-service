import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { ZodExceptionFilter } from "./zod-exception.filter";
const { PORT = 8080, HOST = "0.0.0.0" } = process.env;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new ZodExceptionFilter());
  await app.listen(PORT, HOST);
}
bootstrap().catch(console.error);
