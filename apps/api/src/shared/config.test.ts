import { expect, test } from "vitest";
import { parseConfiguration } from "./config";

const local = {
  DATABASE_URL: "postgresql://test:test@127.0.0.1:5432/soe_test",
};
test("dispensa de MFA é explícita e restrita ao desenvolvimento local", () => {
  expect(parseConfiguration(local).DEV_MFA_BYPASS).toBe(false);
  expect(
    parseConfiguration({ ...local, DEV_MFA_BYPASS: "false" }).DEV_MFA_BYPASS,
  ).toBe(false);
  expect(
    parseConfiguration({ ...local, DEV_MFA_BYPASS: "true" }).DEV_MFA_BYPASS,
  ).toBe(true);
  const parsed = parseConfiguration({ ...local, DEV_MFA_BYPASS: "true" });
  expect(parseConfiguration(parsed)).toEqual(parsed);
  for (const change of [
    { NODE_ENV: "test" },
    { NODE_ENV: "production" },
    { API_HOST: "0.0.0.0" },
    { AUTH_ORIGIN: "https://school.example.test" },
    { DATABASE_URL: "postgresql://test:test@remote.example.test/soe_test" },
    { DEV_MFA_BYPASS: "yes" },
  ])
    expect(() =>
      parseConfiguration({ ...local, DEV_MFA_BYPASS: "true", ...change }),
    ).toThrow(/DEV_MFA_BYPASS/);
});

test("configuração inválida falha sem revelar o valor recebido", () => {
  expect(() =>
    parseConfiguration({ DATABASE_URL: "sensitive-secret" }),
  ).toThrow("Invalid server configuration: DATABASE_URL");
  try {
    parseConfiguration({ DATABASE_URL: "sensitive-secret" });
  } catch (error) {
    expect(String(error)).not.toContain("sensitive-secret");
  }
});
