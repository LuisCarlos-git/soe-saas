import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}
export function Button({
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-base font-semibold text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60 ${className}`}
    >
      {loading && (
        <LoaderCircle
          aria-hidden="true"
          data-loading-spinner
          className="soe-button-spinner size-4 shrink-0"
        />
      )}
      {children}
    </button>
  );
}

export { Toaster, toast } from "./components/sonner.js";

export { BookIllustration } from "./illustrations/book/book-illustration.js";
export { PageLoading } from "./motion/page-loading.js";
