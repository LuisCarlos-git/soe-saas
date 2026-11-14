import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { createDatabase } from "@soe/database";
import type { parseConfiguration } from "../../../platform/config.js";
import type { SessionReader } from "../application/ports/session-reader.js";

export function createAuthentication(
  config: ReturnType<typeof parseConfiguration>,
) {
  const database = createDatabase(config.DATABASE_URL);
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
    sessions: {
      async read(credential) {
        const result = await auth.api.getSession({
          headers: new Headers({ cookie: credential }),
        });
        return result
          ? {
              id: result.user.id,
              name: result.user.name,
              email: result.user.email,
            }
          : null;
      },
    } satisfies SessionReader,
    async onModuleDestroy() {
      await database.$disconnect();
    },
  };
}
