import type { ComponentProps } from "react";
import { cn } from "@soe/ui";
import { RadioGroup, RadioGroupItem } from "@soe/ui/primitives/radio-group";
import { Label } from "@soe/ui/primitives/label";
import { useFieldControl } from "../field-control";
import type { ChoiceOption, FieldContentProps } from "../field-control";
import { FieldFrame } from "./field-frame";

export type RadioGroupFieldProps = FieldContentProps &
  Omit<
    ComponentProps<typeof RadioGroup>,
    | "id"
    | "name"
    | "value"
    | "defaultValue"
    | "onValueChange"
    | "onBlur"
    | "children"
  > & {
    options: readonly ChoiceOption[];
  };

export function RadioGroupField({
  id,
  label,
  description,
  options,
  disabled,
  className,
  ...props
}: RadioGroupFieldProps) {
  const control = useFieldControl<string>({ id, label, description });
  return (
    <FieldFrame {...control.frameProps} group>
      <RadioGroup
        {...props}
        {...control.controlProps}
        name={control.field.name}
        value={control.value}
        onValueChange={control.field.handleChange}
        aria-labelledby={`${control.id}-label`}
        disabled={disabled}
        className={cn("gap-1", className)}
      >
        {options.map((option, index) => (
          <div key={option.value} className="flex min-h-11 items-center gap-3">
            <RadioGroupItem
              id={`${control.id}-${index}`}
              value={option.value}
              disabled={disabled || option.disabled}
            />
            <Label
              htmlFor={`${control.id}-${index}`}
              className="flex min-h-11 flex-1 items-center font-normal"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </FieldFrame>
  );
}
