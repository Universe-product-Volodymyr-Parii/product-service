import { CallHandler, ExecutionContext, Injectable, Logger, type NestInterceptor } from "@nestjs/common";
import { tap } from "rxjs";

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<{
      method: string;
      originalUrl?: string;
      url?: string;
    }>();
    const response = context.switchToHttp().getResponse<{ statusCode: number }>();
    const startedAt = process.hrtime.bigint();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logRequest(request.method, request.originalUrl ?? request.url ?? "", response.statusCode, startedAt);
        },
        error: () => {
          this.logRequest(request.method, request.originalUrl ?? request.url ?? "", response.statusCode, startedAt);
        },
      }),
    );
  }

  private logRequest(method: string, url: string, statusCode: number, startedAt: bigint): void {
    const finishedAt = process.hrtime.bigint();
    const durationMs = Number(finishedAt - startedAt) / 1_000_000;

    this.logger.log(`${method} ${url} ${statusCode} - ${durationMs.toFixed(2)}ms`);
  }
}
