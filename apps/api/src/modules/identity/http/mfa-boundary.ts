import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";
import {
  AuthenticationRequired,
  MfaRequired,
} from "../use-cases/session-security.use-case";
import type { createAuthentication } from "../factories/authentication.factory";
export function mfaBoundary(auth: ReturnType<typeof createAuthentication>) {
  const publicPaths = new Set([
    "/api/v1/environment",
    "/api/v1/identity/session",
    "/api/v1/identity/mfa",
    "/api/v1/identity/school-access",
    "/api/v1/identity/memberships",
    "/api/v1/invitations/preview",
    "/api/v1/invitations/register",
    "/api/v1/invitations/accept",
  ]);
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!/^\/api\/v1(?:\/|$)/i.test(req.path) || publicPaths.has(req.path))
      return next();
    res.setHeader("Cache-Control", "no-store");
    try {
      await auth.security.requireMfa(req.headers.cookie ?? "");
      return next();
    } catch (error) {
      if (
        error instanceof AuthenticationRequired ||
        error instanceof MfaRequired
      ) {
        return res.status(error instanceof MfaRequired ? 403 : 401).json({
          code: error instanceof MfaRequired ? "MFA_REQUIRED" : "AUTH_REQUIRED",
          message:
            "Verifique sua identidade com o aplicativo autenticador para continuar.",
          correlationId: randomUUID(),
        });
      }
      return res.status(503).json({
        code: "UNAVAILABLE",
        message: "Não foi possível verificar sua identidade. Tente novamente.",
        correlationId: randomUUID(),
      });
    }
  };
}
