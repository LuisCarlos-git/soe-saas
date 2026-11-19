import { SessionSecurity } from "../use-cases/session-security.use-case";
import { twoFactor } from "better-auth/plugins";
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
    plugins: [twoFactor({ issuer: "SOE" })],
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
        "/two-factor/*": {
          window: config.AUTH_RATE_WINDOW,
          max: config.AUTH_RATE_MAX,
        },
        "/sign-in/email": {
          window: config.AUTH_RATE_WINDOW,
          max: config.AUTH_RATE_MAX,
        },
      },
    },
    logger: { disabled: true },
  });
  return {
    handler: async (request: Request) => {
      const response = await auth.handler(request);
      if (
        new URL(request.url).pathname.endsWith("/two-factor/verify-totp") &&
        response.ok
      ) {
        // Mark only the exact session authenticated by the provider. Old sessions remain unverified.
        const cookies = response.headers.getSetCookie();
        const fresh = cookies.find((c) =>
          /^(?:__Secure-)?soe\.session_token=/.test(c),
        );
        const credential =
          fresh?.split(";")[0] ?? request.headers.get("cookie") ?? "";
        const session = await auth.api.getSession({
          headers: new Headers({ cookie: credential }),
        });
        if (!session?.user.twoFactorEnabled)
          throw new Error("MFA verification unavailable");
        await database.session.update({
          where: { id: session.session.id },
          data: { mfaVerified: true },
        });
      }
      return response;
    },
    security: new SessionSecurity({
      findByCredential: async (credential: string) => {
        const session = await auth.api.getSession({
          headers: new Headers({ cookie: credential }),
        });
        if (!session) return null;
        const persisted = await database.session.findUnique({
          where: { id: session.session.id },
          select: { mfaVerified: true },
        });
        return {
          enabled: !!session.user.twoFactorEnabled,
          verified: !!session.user.twoFactorEnabled && !!persisted?.mfaVerified,
        };
      },
    }),
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
