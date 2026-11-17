import type { ComponentProps } from "react";
import { cn } from "@soe/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@soe/ui/primitives/select";
import { useFieldControl } from "../field-control";
import type { ChoiceOption, FieldContentProps } from "../field-control";
import { FieldFrame, fieldControlClassName } from "./field-frame";

export type SelectFieldProps = FieldContentProps &
  Omit<
    ComponentProps<typeof Select>,
    "name" | "value" | "defaultValue" | "onValueChange" | "children"
  > & {
    options: readonly ChoiceOption[];
    placeholder?: string;
    className?: string;
  };

export function SelectField({
  id,
  label,
  description,
  options,
  placeholder = "Selecione",
  className,
  ...props
}: SelectFieldProps) {
  const control = useFieldControl<string>({ id, label, description });
  return (
    <FieldFrame {...control.frameProps}>
      <Select
        {...props}
        name={control.field.name}
        value={control.value}
        onValueChange={control.field.handleChange}
      >
        <SelectTrigger
          {...control.controlProps}
          className={cn(fieldControlClassName, className)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldFrame>
  );
}
