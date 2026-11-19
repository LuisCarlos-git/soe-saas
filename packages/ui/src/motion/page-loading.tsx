import { BookIllustration } from "../illustrations/book/book-illustration";

export function PageLoading({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="soe-page-loading pointer-events-none fixed inset-0 z-40 grid place-items-center bg-canvas/95 px-6">
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="w-56 text-center text-ink"
      >
        <BookIllustration play />
        <p className="mt-2 text-base font-medium">Carregando página…</p>
      </div>
    </div>
  );
}
