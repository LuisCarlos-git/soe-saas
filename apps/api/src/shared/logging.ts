import { randomUUID } from "node:crypto";
import type { Options } from "pino-http";

export function httpLoggerOptions(level: string): Options {
  return {
    level,
    base: { service: "soe-api" },
    genReqId: (_request, response) => {
      const id = randomUUID();
      response.setHeader("x-correlation-id", id);
      return id;
    },
    serializers: {
      req: () => undefined,
      res: (response: { statusCode: number }) => ({
        statusCode: response.statusCode,
      }),
      err: () => ({ code: "REQUEST_FAILED" }),
    },
    customSuccessMessage: () => "request.completed",
    customErrorMessage: () => "request.failed",
    customProps: (request) => ({ correlationId: request.id }),
    redact: ["authorization", "cookie", "password", "token", "body", "query"],
  };
}
