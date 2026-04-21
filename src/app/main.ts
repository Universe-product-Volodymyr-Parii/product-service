import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 8080, process.env.HOST ?? "0.0.0.0");
}
bootstrap().catch(console.error);
