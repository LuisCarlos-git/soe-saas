import type { ComponentProps } from "react";
import { cn } from "@soe/ui";
import {
  NativeSelect,
  NativeSelectOption,
} from "@soe/ui/primitives/native-select";
import { useFieldControl } from "../field-control";
import type { ChoiceOption, FieldContentProps } from "../field-control";
import { FieldFrame, fieldControlClassName } from "./field-frame";

export type NativeSelectFieldProps = FieldContentProps &
  Omit<
    ComponentProps<typeof NativeSelect>,
    | "id"
    | "name"
    | "value"
    | "defaultValue"
    | "onChange"
    | "onBlur"
    | "children"
    | "multiple"
  > & {
    options: readonly ChoiceOption[];
    placeholder?: string;
  };

export function NativeSelectField({
  id,
  label,
  description,
  options,
  placeholder = "Selecione",
  className,
  ...props
}: NativeSelectFieldProps) {
  const control = useFieldControl<string>({ id, label, description });
  return (
    <FieldFrame {...control.frameProps}>
      <div className="[&>[data-slot=native-select-wrapper]]:w-full">
        <NativeSelect
          {...props}
          {...control.controlProps}
          name={control.field.name}
          value={control.value}
          onChange={(event) => control.field.handleChange(event.target.value)}
          className={cn(fieldControlClassName, className)}
        >
          <NativeSelectOption value="">{placeholder}</NativeSelectOption>
          {options.map((option) => (
            <NativeSelectOption
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
    </FieldFrame>
  );
}
