import {
  Catch,
  HttpException,
  type ArgumentsHost,
  type ExceptionFilter,
} from "@nestjs/common";
import { EnvironmentUnavailable } from "@soe/backend";
import { errorSchema } from "@soe/contracts";
import type { Response } from "express";
import { randomUUID } from "node:crypto";

@Catch()
export class SafeErrorFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    // Parser errors can reach this filter before request logging initializes.
    const correlation = errorSchema.shape.correlationId.safeParse(
      response.getHeader("x-correlation-id"),
    );
    const correlationId = correlation.success ? correlation.data : randomUUID();
    response.setHeader("x-correlation-id", correlationId);
    const oversizedBody =
      error instanceof Error &&
      "type" in error &&
      error.type === "entity.too.large" &&
      "status" in error &&
      error.status === 413;
    const status = oversizedBody
      ? 413
      : error instanceof EnvironmentUnavailable
        ? 503
        : error instanceof HttpException
          ? error.getStatus()
          : 500;
    const code =
      status === 400 || status === 413
        ? "INVALID_INPUT"
        : status === 404
          ? "NOT_FOUND"
          : status === 503
            ? "UNAVAILABLE"
            : "INTERNAL_ERROR";
    response.status(status).setHeader("Cache-Control", "no-store");
    response.json(
      errorSchema.parse({
        code,
        message:
          status === 413
            ? "Corpo da requisição excede o limite permitido."
            : status === 400
              ? "Parâmetros inválidos."
              : status === 404
                ? "Recurso não encontrado."
                : status === 503
                  ? "Ambiente temporariamente indisponível."
                  : "Não foi possível concluir a operação.",
        correlationId,
      }),
    );
  }
}
