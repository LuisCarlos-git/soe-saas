import { cn } from "#lib/utils";
import { useEffect, useState } from "react";
import { FieldError } from "../primitives/field";

interface FieldMessageProps {
  id: string;
  message?: string;
}

export function FieldMessage({ id, message = "" }: FieldMessageProps) {
  const [retainedMessage, setRetainedMessage] = useState(message);
  useEffect(() => {
    if (message) setRetainedMessage(message);
  }, [message]);
  return (
    <div className={cn("t-input-wrap", { "is-error": Boolean(message) })}>
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
  );
}
