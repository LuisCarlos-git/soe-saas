import type { ReactNode } from "react";
import { cn } from "#lib/utils";

export function PageHeader({
  title,
  description,
  back,
  actions,
  className,
}: {
  title: string;
  description?: ReactNode;
  back?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-start justify-between gap-4",
        className,
      )}
    >
      <div className="flex min-w-0 basis-56 flex-1 items-start gap-3">
        {back}
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {title}
          </h1>
          {description && (
            <p className="mt-1 max-w-2xl break-words text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}
