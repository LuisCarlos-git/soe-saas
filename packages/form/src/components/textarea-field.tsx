import type { ComponentProps } from "react";
import { cn } from "@soe/ui";
import { Textarea } from "@soe/ui/primitives/textarea";
import { useFieldControl } from "../field-control";
import type { FieldContentProps } from "../field-control";
import { FieldFrame, fieldControlClassName } from "./field-frame";

export type TextareaFieldProps = FieldContentProps &
  Omit<
    ComponentProps<typeof Textarea>,
    "id" | "name" | "value" | "defaultValue" | "onChange" | "onBlur"
  >;

export function TextareaField({
  id,
  label,
  description,
  className,
  ...props
}: TextareaFieldProps) {
  const control = useFieldControl<string>({ id, label, description });
  return (
    <FieldFrame {...control.frameProps}>
      <Textarea
        {...props}
        {...control.controlProps}
        name={control.field.name}
        value={control.value}
        onChange={(event) => control.field.handleChange(event.target.value)}
        className={cn(
          fieldControlClassName,
          "min-h-24 md:text-base",
          className,
        )}
      />
    </FieldFrame>
  );
}
