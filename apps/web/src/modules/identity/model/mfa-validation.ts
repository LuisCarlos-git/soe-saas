import { mfaEnrollmentSchema } from "@soe/contracts";
import { z } from "zod";
export const mfaEnrollmentFormSchema = mfaEnrollmentSchema.extend({
  password: z.clone(mfaEnrollmentSchema.shape.password, {
    ...mfaEnrollmentSchema.shape.password.def,
    error: (issue: z.core.$ZodRawIssue) =>
      issue.code === "too_big"
        ? "A senha deve ter no máximo 128 caracteres."
        : "Confirme sua senha para configurar o aplicativo.",
  }),
});
