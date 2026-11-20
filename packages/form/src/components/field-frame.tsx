import type { ReactNode } from "react";
import { cn, FieldMessage } from "@soe/ui";
import { Label } from "@soe/ui/primitives/label";

interface FieldFrameProps {
  id: string;
  label: string;
  description?: ReactNode;
  error: string;
  reserveErrorSpace?: boolean;
  inline?: boolean;
  group?: boolean;
  children: ReactNode;
}

export function FieldFrame({
  id,
  label,
  description,
  error,
  reserveErrorSpace = true,
  inline = false,
  group = false,
  children,
}: FieldFrameProps) {
  let labelElement = (
    <Label
      htmlFor={id}
      className={cn("font-medium text-ink", {
        "mb-2 block": !inline,
        "flex min-h-11 flex-1 items-center": inline,
      })}
    >
      {label}
    </Label>
  );
  if (group) {
    labelElement = (
      <p id={`${id}-label`} className="mb-2 text-sm font-medium text-ink">
        {label}
      </p>
    );
  }
  return (
    <div>
      <div className={cn({ "flex min-h-11 items-center gap-3": inline })}>
        {!inline && labelElement}
        {children}
        {inline && labelElement}
      </div>
      {description && (
        <p
          id={`${id}-description`}
          className="mt-2 text-sm leading-5 text-muted-foreground"
        >
          {description}
        </p>
      )}
      <FieldMessage
        id={`${id}-error`}
        message={error}
        reserveSpace={reserveErrorSpace}
      />
    </div>
  );
}

export const fieldControlClassName =
  "w-full min-h-11 rounded-lg border-control bg-surface text-base text-ink shadow-none focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-invalid:border-negative aria-invalid:focus-visible:outline-negative";
