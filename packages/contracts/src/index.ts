import { z } from "zod";

export const environmentQuerySchema = z.strictObject({
  probe: z.literal("bootstrap").default("bootstrap"),
});
export const environmentSchema = z.strictObject({
  status: z.literal("ok"),
  sample: z.string().min(1).max(120),
});
export const healthSchema = z.strictObject({
  status: z.enum(["ok", "unavailable"]),
});
export const errorSchema = z.strictObject({
  code: z.enum([
    "INVALID_INPUT",
    "UNAVAILABLE",
    "NOT_FOUND",
    "INTERNAL_ERROR",
    "AUTH_REQUIRED",
    "INVALID_CREDENTIALS",
    "FORBIDDEN",
    "TOO_MANY_REQUESTS",
  ]),
  message: z.string(),
  correlationId: z.string().uuid(),
});
export type Environment = z.infer<typeof environmentSchema>;

export const loginSchema = z.strictObject({
  email: z.email().max(254),
  password: z.string().min(1).max(128),
});
export const identitySchema = z.strictObject({
  id: z.string(),
  name: z.string(),
  email: z.email(),
});
