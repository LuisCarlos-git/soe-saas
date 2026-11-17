import { lazy, Suspense } from "react";
import type { ReactElement } from "react";

export function lazyField<Props extends object>(
  load: () => Promise<{ default: (props: Props) => ReactElement }>,
) {
  const Component = lazy(load);
  return function LazyField(props: Props) {
    return (
      <Suspense
        fallback={
          <div role="status" className="min-h-24 text-sm text-muted-foreground">
            Carregando campo…
          </div>
        }
      >
        <Component {...props} />
      </Suspense>
    );
  };
}
