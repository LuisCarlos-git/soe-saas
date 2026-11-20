import { cn } from "#lib/utils";
import { useEffect, useState } from "react";
import { FieldError } from "../primitives/field";

interface FieldMessageProps {
  id: string;
  message?: string;
  reserveSpace?: boolean;
}

export function FieldMessage({
  id,
  message = "",
  reserveSpace = true,
}: FieldMessageProps) {
  const [retainedMessage, setRetainedMessage] = useState(message);
  useEffect(() => {
    if (message) setRetainedMessage(message);
  }, [message]);
  return (
    <div
      data-compact={!reserveSpace || undefined}
      className={cn("t-input-wrap", { "is-error": Boolean(message) })}
    >
      <div className={cn({ "min-h-0 overflow-hidden": !reserveSpace })}>
        <FieldError
          id={id}
          aria-live="polite"
          aria-atomic="true"
          aria-hidden={!message}
          className="t-error-msg mt-2 min-h-5 text-sm leading-5 text-negative"
        >
          {message || retainedMessage || "\u00a0"}
        </FieldError>
      </div>
    </div>
  );
}
