import { describe, expect, it } from "vitest";
import { loginSchema } from "@soe/contracts";
import { loginFormSchema } from "./login-validation";

describe("login form validation", () => {
  it.each([
    ["email", "", "Informe seu e-mail."],
    ["email", "   ", "Informe seu e-mail."],
    ["email", "ana@", "Informe um e-mail válido."],
    ["password", "", "Informe sua senha."],
    ["password", "a".repeat(129), "A senha deve ter no máximo 128 caracteres."],
  ] as const)("localizes invalid %s", (field, value, message) => {
    const result = loginFormSchema.safeParse({
      email: "ana@example.test",
      password: "12345678",
      [field]: value,
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: [field], message }),
    ]);
  });

  it("preserves the API limits and accepts existing short passwords at sign-in", () => {
    const emailAtLimit = `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(56)}.test`;
    const values = [
      { email: emailAtLimit, password: "a".repeat(128) },
      { email: `a${emailAtLimit}`, password: "a" },
      { email: "ana@example.test", password: "a" },
      { email: "ana@example.test", password: "a".repeat(129) },
      { email: "ana@example.test", password: "" },
      { email: "ana@example.test", password: "12345678", extra: true },
    ];

    expect(loginFormSchema.safeParse(values[0]).success).toBe(true);
    expect(loginFormSchema.safeParse(values[1]).error?.issues).toEqual([
      expect.objectContaining({
        path: ["email"],
        message: "O e-mail deve ter no máximo 254 caracteres.",
      }),
    ]);
    expect(loginFormSchema.safeParse(values[2]).success).toBe(true);
    for (const value of values) {
      expect(loginFormSchema.safeParse(value).success).toBe(
        loginSchema.safeParse(value).success,
      );
    }
  });

  it("provides field paths and messages through Standard Schema", async () => {
    const result = await loginFormSchema["~standard"].validate({
      email: "",
      password: "",
    });

    expect(result.issues).toEqual([
      expect.objectContaining({
        path: ["email"],
        message: "Informe seu e-mail.",
      }),
      expect.objectContaining({
        path: ["password"],
        message: "Informe sua senha.",
      }),
    ]);
  });
});
