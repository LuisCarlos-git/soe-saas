import type {
  Request as ExpressRequest,
  Response,
  NextFunction,
} from "express";
import { randomUUID } from "node:crypto";
import { loginSchema } from "@soe/contracts";
import type { createAuthentication, parseConfiguration } from "@soe/backend";

// Only the fixed public origin constructs the upstream URL. Never trust Host or forwarded IP headers.
export function authenticationHandler(
  auth: ReturnType<typeof createAuthentication>,
  config: ReturnType<typeof parseConfiguration>,
  completed: (event: {
    correlationId: string;
    status: number;
    operation: string;
  }) => void,
) {
  return async (req: ExpressRequest, res: Response, next: NextFunction) => {
    if (!req.path.startsWith("/api/auth/")) return next();
    const correlationId = randomUUID();
    res.setHeader("x-correlation-id", correlationId);
    res.setHeader("Cache-Control", "no-store");
    res.once("finish", () =>
      completed({
        correlationId,
        status: res.statusCode,
        operation:
          req.path === "/api/auth/sign-in/email"
            ? "session.start"
            : req.path === "/api/auth/sign-out"
              ? "session.end"
              : "auth.unmatched",
      }),
    );
    const fail = (status: number, code: string, message: string) =>
      res.status(status).json({ code, message, correlationId });
    if (
      req.method !== "POST" ||
      !["/api/auth/sign-in/email", "/api/auth/sign-out"].includes(req.path)
    )
      return fail(404, "NOT_FOUND", "Recurso não encontrado.");
    if (
      req.headers.origin !== config.AUTH_ORIGIN ||
      req.headers["sec-fetch-site"] === "cross-site"
    )
      return fail(403, "FORBIDDEN", "Origem da solicitação não permitida.");
    const signingIn = req.path.endsWith("sign-in/email");
    const input = signingIn ? loginSchema.safeParse(req.body) : null;
    if (input && !input.success)
      return fail(400, "INVALID_INPUT", "Informe e-mail e senha válidos.");
    try {
      const headers = new Headers({
        "Content-Type": "application/json",
        origin: config.AUTH_ORIGIN,
        "x-soe-client-ip": req.socket.remoteAddress ?? "unknown",
      });
      if (req.headers.cookie) headers.set("cookie", req.headers.cookie);
      const response = await auth.handler(
        new Request(new URL(req.path, config.AUTH_ORIGIN), {
          method: "POST",
          headers,
          body: JSON.stringify(input?.success ? input.data : {}),
        }),
      );
      if (response.status === 429) {
        res.setHeader(
          "Retry-After",
          response.headers.get("retry-after") ??
            String(config.AUTH_RATE_WINDOW),
        );
        return fail(
          429,
          "TOO_MANY_REQUESTS",
          "Muitas tentativas. Aguarde e tente novamente.",
        );
      }
      if (!response.ok)
        return fail(
          response.status >= 500 ? 503 : 401,
          response.status >= 500 ? "UNAVAILABLE" : "INVALID_CREDENTIALS",
          response.status >= 500
            ? "Acesso temporariamente indisponível."
            : "E-mail ou senha inválidos.",
        );
      for (const cookie of response.headers.getSetCookie())
        res.append("Set-Cookie", cookie);
      // The provider response includes a token: deliberately discard the entire body.
      return res.status(204).end();
    } catch {
      return fail(503, "UNAVAILABLE", "Acesso temporariamente indisponível.");
    }
  };
}
