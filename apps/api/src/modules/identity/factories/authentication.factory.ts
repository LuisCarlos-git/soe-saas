import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import type { Database } from "../../../infrastructure/database/database.factory";
import type { parseConfiguration } from "../../../shared/config";
import { BetterAuthSessionRepository } from "../infrastructure/better-auth-session.repository";
import { CurrentIdentity } from "../use-cases/current-identity.use-case";

export function createAuthentication(
  config: ReturnType<typeof parseConfiguration>,
  database: Database,
) {
  const auth = betterAuth({
    database: prismaAdapter(database, {
      provider: "postgresql",
      transaction: true,
    }),
    secret: config.AUTH_SECRET,
    baseURL: config.AUTH_ORIGIN,
    trustedOrigins: [config.AUTH_ORIGIN],
    emailAndPassword: { enabled: true, disableSignUp: true },
    session: {
      expiresIn: 28800,
      cookieCache: { enabled: false },
      disableSessionRefresh: true,
    },
    advanced: {
      cookiePrefix: "soe",
      useSecureCookies: config.NODE_ENV === "production",
      defaultCookieAttributes: { httpOnly: true, sameSite: "lax" },
      ipAddress: { ipAddressHeaders: ["x-soe-client-ip"] },
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: config.AUTH_RATE_WINDOW,
      max: config.AUTH_RATE_MAX,
      customRules: {
        "/sign-in/email": {
          window: config.AUTH_RATE_WINDOW,
          max: config.AUTH_RATE_MAX,
        },
      },
    },
    logger: { disabled: true },
  });
  return {
    handler: (request: Request) => auth.handler(request),
    current: new CurrentIdentity(
      new BetterAuthSessionRepository(async (credential) => {
        const result = await auth.api.getSession({
          headers: new Headers({ cookie: credential }),
        });
        if (!result) return null;
        return {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        };
      }),
    ),
  };
}
