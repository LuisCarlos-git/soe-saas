import {
  Catch,
  HttpException,
  type ArgumentsHost,
  type ExceptionFilter,
} from "@nestjs/common";
import { EnvironmentUnavailable } from "../../modules/environment/domain/environment";
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
    let status = 500;
    if (error instanceof HttpException) status = error.getStatus();
    if (error instanceof EnvironmentUnavailable) status = 503;
    if (oversizedBody) status = 413;
    const safeErrors: Record<number, { code: string; message: string }> = {
      400: { code: "INVALID_INPUT", message: "Parâmetros inválidos." },
      401: {
        code: "AUTH_REQUIRED",
        message: "Não foi possível concluir a operação.",
      },
      403: { code: "FORBIDDEN", message: "Acesso não permitido." },
      404: { code: "NOT_FOUND", message: "Recurso não encontrado." },
      413: {
        code: "INVALID_INPUT",
        message: "Corpo da requisição excede o limite permitido.",
      },
      429: {
        code: "TOO_MANY_REQUESTS",
        message: "Muitas tentativas. Aguarde e tente novamente.",
      },
      503: {
        code: "UNAVAILABLE",
        message: "Ambiente temporariamente indisponível.",
      },
    };
    const safe = safeErrors[status] ?? {
      code: "INTERNAL_ERROR",
      message: "Não foi possível concluir a operação.",
    };
    response.status(status).setHeader("Cache-Control", "no-store");
    response.json(errorSchema.parse({ ...safe, correlationId }));
  }
}
