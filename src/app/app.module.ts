import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";

import { ProductModule } from "@modules/product/product.module";

import { envSchema } from "@infra/env/env.validator";
import { InfraModule } from "@infra/infra.module";

import { RequestLoggingInterceptor } from "@lib/interceptors/request-logging.interceptor";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    InfraModule.forRoot(),
    ProductModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggingInterceptor,
    },
  ],
})
export class AppModule {}
