import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { Injectable, Logger } from "@nestjs/common";

import { EnvService } from "@infra/env/env.service";

type ProductEventType = "product.created" | "product.deleted";

type ProductEventPayload = {
  data: Record<string, unknown>;
  occurredAt: string;
  type: ProductEventType;
};

@Injectable()
export class SqsService {
  private readonly logger = new Logger(SqsService.name);
  private readonly client: SQSClient;
  private readonly queueUrl: string;

  constructor(private readonly envService: EnvService) {
    this.client = new SQSClient({
      credentials: {
        accessKeyId: this.envService.get("AWS_ACCESS_KEY_ID"),
        secretAccessKey: this.envService.get("AWS_SECRET_ACCESS_KEY"),
      },
      endpoint: this.envService.get("SQS_ENDPOINT"),
      region: this.envService.get("AWS_REGION"),
    });
    this.queueUrl = this.envService.get("SQS_QUEUE_URL");
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

  private async publish(payload: ProductEventPayload): Promise<void> {
    try {
      await this.client.send(
        new SendMessageCommand({
          MessageBody: JSON.stringify(payload),
          QueueUrl: this.queueUrl,
        }),
      );
    } catch (error) {
      this.logger.error(`Failed to publish ${payload.type} event to SQS`, error);
    }
  }
}
