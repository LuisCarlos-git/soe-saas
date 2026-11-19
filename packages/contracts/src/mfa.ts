import { z } from "zod";
export const mfaEnrollmentSchema = z.strictObject({
  password: z.string().min(1).max(128),
});
export const mfaVerificationSchema = z.strictObject({
  code: z.string().regex(/^\d{6}$/, "Informe os seis dígitos do aplicativo."),
});
export const mfaSetupSchema = z.strictObject({
  totpURI: z.string().startsWith("otpauth://totp/"),
});
export const mfaStatusSchema = z.strictObject({
  enabled: z.boolean(),
  verified: z.boolean(),
});
export const mfaChallengeSchema = z.strictObject({
  twoFactorRedirect: z.literal(true),
});
