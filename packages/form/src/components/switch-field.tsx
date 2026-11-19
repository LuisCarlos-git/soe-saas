import type { ComponentProps } from "react";
import { Switch } from "@soe/ui/primitives/switch";
import { useFieldControl } from "../field-control";
import type { FieldContentProps } from "../field-control";
import { FieldFrame } from "./field-frame";

export type SwitchFieldProps = FieldContentProps &
  Omit<
    ComponentProps<typeof Switch>,
    "id" | "name" | "checked" | "defaultChecked" | "onCheckedChange" | "onBlur"
  >;

export function SwitchField({
  id,
  label,
  description,
  ...props
}: SwitchFieldProps) {
  const control = useFieldControl<boolean>({ id, label, description });
  return (
    <FieldFrame {...control.frameProps} inline>
      <Switch
        {...props}
        {...control.controlProps}
        name={control.field.name}
        checked={control.value}
        onCheckedChange={control.field.handleChange}
      />
    </FieldFrame>
  );
}
