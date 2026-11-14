import { useEffect, useRef } from "react";

// Client-mounted SVG; SSR keeps its reserved space and the loader's accessible text.
export function BookIllustration({ play = false }: { play?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void import("./book-runtime.js").then(({ createBookFigure }) => {
      if (disposed || !host.current) return;
      const figure = createBookFigure(host.current, { play, theme: "light" });
      cleanup = () => figure.destroy();
    });
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [play]);
  return (
    <div
      ref={host}
      aria-hidden="true"
      className="soe-book-illustration aspect-[5/4] w-full"
    />
  );
}
