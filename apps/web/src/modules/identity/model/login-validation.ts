import { loginSchema } from "@soe/contracts";
import { z } from "zod";

// Preserve the shared constraints; only presentation messages differ in the web.
export const loginFormSchema = loginSchema.extend({
  email: z.clone(loginSchema.shape.email, {
    ...loginSchema.shape.email.def,
    error: (issue: z.core.$ZodRawIssue) => {
      if (typeof issue.input === "string" && !issue.input.trim())
        return "Informe seu e-mail.";
      if (issue.code === "too_big")
        return `O e-mail deve ter no máximo ${issue.maximum} caracteres.`;
      return "Informe um e-mail válido.";
    },
  }),
  password: z.clone(loginSchema.shape.password, {
    ...loginSchema.shape.password.def,
    error: (issue: z.core.$ZodRawIssue) => {
      if (issue.code === "too_big")
        return `A senha deve ter no máximo ${issue.maximum} caracteres.`;
      return "Informe sua senha.";
    },
  }),
});
