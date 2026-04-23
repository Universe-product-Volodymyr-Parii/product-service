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
  private static readonly RETRY_DELAY_MS = 5000;

  private readonly logger = new Logger(SqsService.name);
  private readonly client: SQSClient;
  private readonly queueUrl: string;
  private readonly pendingEvents: ProductEventPayload[] = [];

  private isFlushing = false;
  private retryTimer: NodeJS.Timeout | null = null;

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
    if (this.retryTimer) {
      clearInterval(this.retryTimer);
    }

    this.client.destroy();
  }

  private async publish(payload: ProductEventPayload): Promise<void> {
    try {
      await this.send(payload);
    } catch (error) {
      this.logger.error(`Failed to publish ${payload.type} event to SQS: ${this.formatError(error)}`);
      this.pendingEvents.push(payload);
      this.logger.warn(`Queued ${payload.type} event in memory. Pending events: ${this.pendingEvents.length}`);
      this.ensureRetryTimer();
    }
  }

  private async flushPendingEvents(): Promise<void> {
    if (this.isFlushing || this.pendingEvents.length === 0) {
      return;
    }

    this.isFlushing = true;

    try {
      while (this.pendingEvents.length > 0) {
        const payload = this.pendingEvents[0];

        await this.send(payload);
        this.pendingEvents.shift();
      }

      if (this.retryTimer) {
        clearInterval(this.retryTimer);
        this.retryTimer = null;
      }

      this.logger.log("Successfully flushed pending SQS events from memory");
    } catch (error) {
      this.logger.warn(`Retrying pending SQS events later: ${this.formatError(error)}`);
    } finally {
      this.isFlushing = false;
    }
  }

  private ensureRetryTimer(): void {
    if (this.retryTimer) {
      return;
    }

    this.logger.warn(`Starting in-memory SQS retry loop with ${SqsService.RETRY_DELAY_MS}ms interval`);

    this.retryTimer = setInterval(() => {
      this.flushPendingEvents();
    }, SqsService.RETRY_DELAY_MS);
  }

  private async send(payload: ProductEventPayload): Promise<void> {
    await this.client.send(
      new SendMessageCommand({
        MessageBody: JSON.stringify(payload),
        QueueUrl: this.queueUrl,
      }),
    );
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

    const details = [errorWithMetadata.name, errorWithMetadata.code, errorWithMetadata.message].filter(Boolean);

    if (errorWithMetadata.$metadata?.attempts) {
      details.push(`sdkAttempts=${errorWithMetadata.$metadata.attempts}`);
    }

    if (errorWithMetadata.$metadata?.totalRetryDelay !== undefined) {
      details.push(`sdkRetryDelay=${errorWithMetadata.$metadata.totalRetryDelay}ms`);
    }

    return details.join(" | ");
  }
}
