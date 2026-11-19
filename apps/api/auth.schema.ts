// CLI-only schema source. Runtime configuration lives in infrastructure.
import { twoFactor } from "better-auth/plugins";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
export const auth = betterAuth({
  plugins: [twoFactor({ issuer: "SOE" })],
  baseURL: "http://127.0.0.1:43120",
  database: prismaAdapter({}, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, disableSignUp: true },
  rateLimit: { enabled: true, storage: "database" },
});
