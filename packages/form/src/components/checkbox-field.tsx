import type { ComponentProps } from "react";
import { Checkbox } from "@soe/ui/primitives/checkbox";
import { useFieldControl } from "../field-control";
import type { FieldContentProps } from "../field-control";
import { FieldFrame } from "./field-frame";

export type CheckboxFieldProps = FieldContentProps &
  Omit<
    ComponentProps<typeof Checkbox>,
    "id" | "name" | "checked" | "defaultChecked" | "onCheckedChange" | "onBlur"
  >;

export function CheckboxField({
  id,
  label,
  description,
  ...props
}: CheckboxFieldProps) {
  const control = useFieldControl<boolean>({ id, label, description });
  return (
    <FieldFrame {...control.frameProps} inline>
      <Checkbox
        {...props}
        {...control.controlProps}
        name={control.field.name}
        checked={control.value}
        onCheckedChange={(checked) =>
          control.field.handleChange(checked === true)
        }
      />
    </FieldFrame>
  );
}
