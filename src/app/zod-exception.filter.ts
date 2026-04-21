import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from "@nestjs/common";
import { ZodError } from "zod";

@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter<ZodError> {
  catch(exception: ZodError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse();

    const error = new BadRequestException({
      details: exception.issues.map((issue) => ({
        message: issue.message,
        path: issue.path.join("."),
      })),
      error: "Bad Request",
      message: "Validation failed",
      statusCode: 400,
    });

    response.status(error.getStatus()).json(error.getResponse());
  }
}
