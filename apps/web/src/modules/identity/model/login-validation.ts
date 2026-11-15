import { loginSchema } from "@soe/contracts";

export function validateLoginEmail(value: string) {
  if (!value.trim()) return "Informe seu e-mail.";
  if (!loginSchema.shape.email.safeParse(value).success)
    return "Informe um e-mail válido.";
  return undefined;
}

export function validateLoginPassword(value: string) {
  if (!value) return "Informe sua senha.";
  if (!loginSchema.shape.password.safeParse(value).success)
    return "A senha deve ter no máximo 128 caracteres.";
  return undefined;
}
