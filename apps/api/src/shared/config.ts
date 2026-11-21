import { z } from "zod";

const configuration = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.url().refine((value) => /^postgres(ql)?:\/\//.test(value)),
  AUTH_ORIGIN: z
    .url()
    .refine(
      (value) => new URL(value).origin === value,
      "Use an origin without path or credentials",
    )
    .default("http://127.0.0.1:43120"),
  AUTH_SECRET: z
    .string()
    .min(32)
    .default("synthetic-development-secret-change-before-production"),
  AUTH_RATE_WINDOW: z.coerce.number().int().min(1).max(3600).default(60),
  AUTH_RATE_MAX: z.coerce.number().int().min(1).max(1000).default(5),
  INVITATION_MAIL_MODE: z
    .enum(["disabled", "development-smtp"])
    .default("disabled"),
  INVITATION_SMTP_HOST: z
    .enum(["127.0.0.1", "localhost", "::1"])
    .default("127.0.0.1"),
  INVITATION_SMTP_PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(43125),
  INVITATION_TTL_SECONDS: z.coerce
    .number()
    .int()
    .min(1)
    .max(604800)
    .default(259200),
  INVITATION_RATE_MAX: z.coerce.number().int().min(1).max(1000).default(30),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(43121),
  API_HOST: z.enum(["127.0.0.1", "0.0.0.0"]).default("127.0.0.1"),
  LOG_LEVEL: z
    .enum(["silent", "error", "warn", "info", "debug"])
    .default("info"),
});

export function parseConfiguration(input: unknown) {
  const parsed = configuration.safeParse(input);
  if (!parsed.success) {
    const fields = [
      ...new Set(parsed.error.issues.map((issue) => issue.path.join("."))),
    ];
    throw new Error(`Invalid server configuration: ${fields.join(", ")}`);
  }
  if (
    parsed.data.NODE_ENV === "production" &&
    (parsed.data.AUTH_SECRET ===
      "synthetic-development-secret-change-before-production" ||
      !parsed.data.AUTH_ORIGIN.startsWith("https://"))
  ) {
    throw new Error("Invalid server configuration: AUTH_SECRET, AUTH_ORIGIN");
  }
  if (
    parsed.data.NODE_ENV === "production" &&
    parsed.data.INVITATION_MAIL_MODE !== "disabled"
  )
    throw new Error("Invalid server configuration: INVITATION_MAIL_MODE");
  return parsed.data;
}
