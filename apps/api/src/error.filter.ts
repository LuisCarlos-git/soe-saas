import {
  Catch,
  HttpException,
  type ArgumentsHost,
  type ExceptionFilter,
} from "@nestjs/common";
import { EnvironmentUnavailable } from "@soe/backend";
import { errorSchema } from "@soe/contracts";
import type { Response } from "express";

@Catch()
export class SafeErrorFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      error instanceof EnvironmentUnavailable
        ? 503
        : error instanceof HttpException
          ? error.getStatus()
          : 500;
    const code =
      status === 400
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
          status === 400
            ? "Parâmetros inválidos."
            : status === 404
              ? "Recurso não encontrado."
              : status === 503
                ? "Ambiente temporariamente indisponível."
                : "Não foi possível concluir a operação.",
        correlationId: response.getHeader("x-correlation-id"),
      }),
    );
  }
}
