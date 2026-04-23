import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";

import { AwsConfig } from "@infra/config/aws.config";

type ProductEventType = "product.created" | "product.deleted";

type ProductEventPayload = {
  data: Record<string, unknown>;
  occurredAt: string;
  type: ProductEventType;
};

@Injectable()
export class SqsService implements OnModuleDestroy {
  private readonly logger = new Logger(SqsService.name);
  private readonly client: SQSClient;
  private readonly queueUrl: string;

  constructor(private readonly awsConfig: AwsConfig) {
    const config = this.awsConfig.getConfig();

    this.client = new SQSClient(config.clientConfig);
    this.queueUrl = config.queueUrl;
  }

  publishProductCreated(data: Record<string, unknown>): void {
    this.publish({
      data,
      occurredAt: new Date().toISOString(),
      type: "product.created",
    });
  }

  publishProductDeleted(data: Record<string, unknown>): void {
    this.publish({
      data,
      occurredAt: new Date().toISOString(),
      type: "product.deleted",
    });
  }

  onModuleDestroy(): void {
    this.client.destroy();
  }

  private async publish(payload: ProductEventPayload): Promise<void> {
    try {
      await this.client.send(
        new SendMessageCommand({
          MessageBody: JSON.stringify(payload),
          QueueUrl: this.queueUrl,
        }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish ${payload.type} event to SQS: ${this.formatError(error)}`,
      );
    }
  }

  private formatError(error: unknown): string {
    if (!(error instanceof Error)) {
      return "Unknown SQS error";
    }

    const errorWithMetadata = error as Error & {
      code?: string;
      $metadata?: {
        attempts?: number;
        totalRetryDelay?: number;
      };
    };

    const details = [
      errorWithMetadata.name,
      errorWithMetadata.code,
      errorWithMetadata.message,
    ].filter(Boolean);

    if (errorWithMetadata.$metadata?.attempts) {
      details.push(`sdkAttempts=${errorWithMetadata.$metadata.attempts}`);
    }

    if (errorWithMetadata.$metadata?.totalRetryDelay !== undefined) {
      details.push(`sdkRetryDelay=${errorWithMetadata.$metadata.totalRetryDelay}ms`);
    }

    return details.join(" | ");
  }
}
