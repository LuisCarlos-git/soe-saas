import type { ReactNode } from "react";
import { cn } from "#lib/utils";

export function PageToolbar({
  description,
  actions,
  className,
}: {
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        className,
      )}
    >
      {description && (
        <p className="min-w-0 max-w-2xl basis-56 flex-1 break-words text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      )}
      {actions && (
        <div className="ml-auto flex max-w-full flex-wrap items-center justify-end gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
