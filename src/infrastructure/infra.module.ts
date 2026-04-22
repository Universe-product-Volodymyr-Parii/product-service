import { DynamicModule, Module } from "@nestjs/common";

import { AwsConfig } from "./config/aws.config";
import { DrizzleClient } from "./db/drizzle.provider";
import { EnvService } from "./env/env.service";
import { SqsService } from "./sqs/sqs.service";

@Module({})
export class InfraModule {
  static forRoot(): DynamicModule {
    return {
      module: InfraModule,
      global: true,
      providers: [AwsConfig, DrizzleClient, EnvService, SqsService],
      exports: [AwsConfig, DrizzleClient, EnvService, SqsService],
    };
  }
}
