import { useId } from "react";
import type { ReactNode } from "react";
import { useSelector } from "@tanstack/react-form";
import { useFieldContext } from "./context";
import { getValidationMessage } from "./validation";

export interface FieldContentProps {
  id?: string | undefined;
  label: string;
  description?: ReactNode;
}

export interface ChoiceOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export function useFieldControl<T>({
  id,
  label,
  description,
}: FieldContentProps) {
  const field = useFieldContext<T>();
  const value = useSelector(field.store, (state) => state.value);
  const meta = useSelector(field.store, (state) => state.meta);
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const error = getValidationMessage(meta.errors, meta.isTouched);
  const describedBy = [
    description && `${controlId}-description`,
    error && `${controlId}-error`,
  ]
    .filter(Boolean)
    .join(" ");
  return {
    field,
    value,
    error,
    id: controlId,
    frameProps: { id: controlId, label, description, error },
    controlProps: {
      id: controlId,
      "aria-invalid": Boolean(error),
      "aria-describedby": describedBy || undefined,
      onBlur: field.handleBlur,
    },
  };
}
