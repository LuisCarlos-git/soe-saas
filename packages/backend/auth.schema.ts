// CLI-only schema source. Runtime configuration lives in infrastructure.
import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
export const auth = betterAuth({
  baseURL: "http://127.0.0.1:43120",
  database: prismaAdapter({}, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, disableSignUp: true },
  rateLimit: { enabled: true, storage: "database" },
});
