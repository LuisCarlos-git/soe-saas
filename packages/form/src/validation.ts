import { defaultValidationLogic } from "@tanstack/react-form";
import type { ValidationLogicFn } from "@tanstack/react-form";

// Reuse one error channel so typing clears errors discovered on blur.
// The default submit strategy already validates every field through onChange.
export const validateOnChangeAndBlur: ValidationLogicFn = (options) => {
  if (options.event.type === "blur") {
    return defaultValidationLogic({
      ...options,
      event: { ...options.event, type: "change" },
    });
  }
  return defaultValidationLogic(options);
};

export function getValidationMessage(
  issues: readonly unknown[],
  visible: boolean,
): string {
  if (!visible) return "";
  const messages = new Set<string>();
  for (const issue of issues) {
    if (typeof issue === "string" && issue) {
      messages.add(issue);
    } else if (
      typeof issue === "object" &&
      issue !== null &&
      "message" in issue &&
      typeof issue.message === "string" &&
      issue.message
    ) {
      messages.add(issue.message);
    }
  }
  return Array.from(messages).join(" ");
}
