import { expect, test } from "vitest";
import { parseConfiguration } from "./config.js";

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
