import type {
  Request as ExpressRequest,
  Response,
  NextFunction,
} from "express";
import { randomUUID } from "node:crypto";
import {
  mfaEnrollmentSchema,
  mfaVerificationSchema,
  mfaSetupSchema,
  mfaChallengeSchema,
  loginSchema,
} from "@soe/contracts";
import type { createAuthentication } from "../factories/authentication.factory";
import type { parseConfiguration } from "../../../shared/config";

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
  const operations: Record<string, string> = {
    "/api/auth/sign-in/email": "session.start",
    "/api/auth/sign-out": "session.end",
    "/api/auth/two-factor/enable": "mfa.enroll",
    "/api/auth/two-factor/verify-totp": "mfa.verify",
  };
  return async (req: ExpressRequest, res: Response, next: NextFunction) => {
    if (!req.path.startsWith("/api/auth/")) return next();
    const correlationId = randomUUID();
    res.setHeader("x-correlation-id", correlationId);
    res.setHeader("Cache-Control", "no-store");
    res.once("finish", () =>
      completed({
        correlationId,
        status: res.statusCode,
        operation: operations[req.path] ?? "auth.unmatched",
      }),
    );
    const fail = (status: number, code: string, message: string) =>
      res.status(status).json({ code, message, correlationId });
    if (req.method !== "POST" || !Object.hasOwn(operations, req.path))
      return fail(404, "NOT_FOUND", "Recurso não encontrado.");
    if (
      req.headers.origin !== config.AUTH_ORIGIN ||
      req.headers["sec-fetch-site"] === "cross-site"
    )
      return fail(403, "FORBIDDEN", "Origem da solicitação não permitida.");
    const signingIn = req.path.endsWith("sign-in/email");
    const enrolling = req.path.endsWith("/two-factor/enable");
    const verifying = req.path.endsWith("/two-factor/verify-totp");
    let body: unknown = {};
    if (signingIn) {
      const input = loginSchema.safeParse(req.body);
      if (!input.success)
        return fail(400, "INVALID_INPUT", "Informe e-mail e senha válidos.");
      body = input.data;
    }
    if (enrolling || verifying) {
      const input = (
        enrolling ? mfaEnrollmentSchema : mfaVerificationSchema
      ).safeParse(req.body);
      if (!input.success)
        return fail(400, "INVALID_INPUT", "Confira os dados informados.");
      body = input.data;
    }
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
          body: JSON.stringify(body),
        }),
      );
      if (response.status === 429) {
        res.setHeader(
          "Retry-After",
          response.headers.get("retry-after") ??
            response.headers.get("x-retry-after") ??
            String(config.AUTH_RATE_WINDOW),
        );
        return fail(
          429,
          "TOO_MANY_REQUESTS",
          "Muitas tentativas. Aguarde e tente novamente.",
        );
      }
      if (response.status >= 500)
        return fail(503, "UNAVAILABLE", "Acesso temporariamente indisponível.");
      if (!response.ok)
        return fail(
          401,
          verifying ? "INVALID_MFA" : "INVALID_CREDENTIALS",
          verifying
            ? "Código inválido ou expirado. Confira o aplicativo ou entre novamente."
            : enrolling
              ? "Não foi possível iniciar a proteção. Confira sua senha e sessão."
              : "E-mail ou senha inválidos.",
        );
      for (const cookie of response.headers.getSetCookie())
        res.append("Set-Cookie", cookie);
      // Allowlist public response fields; tokens and recovery material never leave this adapter.
      if (enrolling) {
        const data = await response.json();
        return res.status(200).json(mfaSetupSchema.strip().parse(data));
      }
      if (signingIn) {
        const data = await response.json();
        if (mfaChallengeSchema.strip().safeParse(data).success)
          return res
            .status(200)
            .json(mfaChallengeSchema.parse({ twoFactorRedirect: true }));
      }
      // All provider session tokens are discarded.
      return res.status(204).end();
    } catch {
      return fail(503, "UNAVAILABLE", "Acesso temporariamente indisponível.");
    }
  };
}
