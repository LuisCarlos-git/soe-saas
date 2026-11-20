import { useId } from "react";
import { Label } from "../primitives/label";
import type { ReactNode } from "react";
import { Input } from "./input";
import type { InputProps } from "./input";
import { FieldMessage } from "./field-message";

export interface InputFieldProps extends InputProps {
  label: string;
  description?: ReactNode;
  error?: string;
  reserveErrorSpace?: boolean;
}

export function InputField({
  id,
  label,
  description,
  error = "",
  reserveErrorSpace = true,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  ...props
}: InputFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;
  const errorId = `${inputId}-error`;
  const descriptions = [
    describedBy,
    description && descriptionId,
    error && errorId,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div>
      <Label htmlFor={inputId} className="mb-2 block font-medium text-ink">
        {label}
      </Label>
      <Input
        {...props}
        id={inputId}
        aria-describedby={descriptions || undefined}
        aria-invalid={error ? true : invalid}
      />
      {description && (
        <p
          id={descriptionId}
          className="mt-2 text-sm leading-5 text-muted-foreground"
        >
          {description}
        </p>
      )}
      <FieldMessage
        id={errorId}
        message={error}
        reserveSpace={reserveErrorSpace}
      />
    </div>
  );
}
