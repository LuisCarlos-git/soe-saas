import { lazy, Suspense, useEffect, useState } from "react";

// Vite eliminates the development branch and its dynamic import from production.
const Devtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((module) => ({
        default: module.ReactQueryDevtools,
      })),
    )
  : () => null;

export function QueryDevtools() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!import.meta.env.DEV || !mounted) return null;
  return (
    <Suspense fallback={null}>
      <Devtools initialIsOpen={false} buttonPosition="bottom-right" />
    </Suspense>
  );
}
