import { cn } from "#lib/utils";
import { LoaderCircle } from "lucide-react";
import type { ComponentProps } from "react";
import { Button as ShadcnButton } from "../primitives/button";

export interface ButtonProps extends Omit<
  ComponentProps<typeof ShadcnButton>,
  "asChild"
> {
  asChild?: false;
  loading?: boolean;
}

export function Button({
  loading = false,
  disabled,
  children,
  className = "",
  variant = "default",
  ...props
}: ButtonProps) {
  return (
    <ShadcnButton
      {...props}
      variant={variant}
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(
        "soe-button h-auto min-h-11 items-center justify-center rounded-lg px-5 py-2 text-base font-semibold focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60",
        { "hover:bg-primary-hover": variant === "default" },
        className,
      )}
    >
      <span className="soe-button-content inline-grid items-center justify-items-center overflow-hidden align-middle">
        <span
          className={cn(
            "t-text-swap soe-button-label col-start-1 row-start-1",
            { "is-exit": loading },
          )}
        >
          {children}
        </span>
        <span
          aria-hidden="true"
          className={cn("t-text-swap soe-button-icon col-start-1 row-start-1", {
            "is-enter-start": !loading,
          })}
        >
          <LoaderCircle
            data-loading-spinner
            className="soe-button-spinner size-4"
          />
        </span>
      </span>
    </ShadcnButton>
  );
}
