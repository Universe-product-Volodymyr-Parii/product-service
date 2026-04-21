import { DynamicModule, Module } from "@nestjs/common";

import { DrizzleClient } from "./db/drizzle.provider";
import { EnvService } from "./env/env.service";

@Module({})
export class InfraModule {
  static forRoot(): DynamicModule {
    return {
      module: InfraModule,
      global: true,
      providers: [DrizzleClient, EnvService],
      exports: [DrizzleClient, EnvService],
    };
  }
}
