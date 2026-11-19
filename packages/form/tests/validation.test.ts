import { describe, expect, it } from "vitest";
import { getValidationMessage } from "../src/index";

describe("form validation messages", () => {
  it("accepts safe messages from unknown validator results without displaying objects", () => {
    const issues: unknown[] = [
      "Informe o nome.",
      { message: "Informe o nome.", path: ["name"] },
      { message: "Revise o valor." },
      { message: 123 },
      { privateValue: "Nunca renderizar" },
      null,
      undefined,
    ];
    expect(getValidationMessage(issues, true)).toBe(
      "Informe o nome. Revise o valor.",
    );
    expect(getValidationMessage(issues, false)).toBe("");
  });
});
