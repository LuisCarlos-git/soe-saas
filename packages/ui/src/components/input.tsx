import { cn } from "#lib/utils";
import type { ComponentProps } from "react";
import { Input as ShadcnInput } from "../primitives/input";

export type InputProps = ComponentProps<"input">;

export function Input({
  className = "",
  "aria-invalid": invalid,
  ...props
}: InputProps) {
  return (
    <ShadcnInput
      {...props}
      aria-invalid={invalid}
      className={cn(
        "t-input min-h-11 shadow-none w-full rounded-lg border border-control bg-surface px-3 text-base text-ink placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:bg-canvas disabled:text-muted-foreground aria-invalid:border-negative aria-invalid:focus-visible:outline-negative",
        { "is-error": invalid === true || invalid === "true" },
        className,
      )}
    />
  );
}
