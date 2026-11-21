import { cn } from "@soe/ui";
import { Checkbox } from "@soe/ui/primitives/checkbox";
import { Label } from "@soe/ui/primitives/label";
import {
  useFieldControl,
  type ChoiceOption,
  type FieldContentProps,
} from "../field-control";
import { FieldFrame } from "./field-frame";

export type CheckboxGroupFieldProps = FieldContentProps & {
  options: readonly ChoiceOption[];
  disabled?: boolean;
  reserveErrorSpace?: boolean;
  className?: string;
};

export function CheckboxGroupField({
  id,
  label,
  description,
  options,
  disabled,
  reserveErrorSpace = false,
  className,
}: CheckboxGroupFieldProps) {
  const control = useFieldControl<string[]>({ id, label, description });
  return (
    <FieldFrame
      {...control.frameProps}
      group
      reserveErrorSpace={reserveErrorSpace}
    >
      <div
        role="group"
        aria-labelledby={`${control.id}-label`}
        aria-describedby={control.controlProps["aria-describedby"]}
        aria-invalid={control.controlProps["aria-invalid"]}
        className={cn("grid gap-x-4 sm:grid-cols-2", className)}
      >
        {options.map((option, index) => (
          <div key={option.value} className="flex min-h-11 items-center gap-3">
            <Checkbox
              id={`${control.id}-${index}`}
              name={control.field.name}
              value={option.value}
              disabled={disabled || option.disabled}
              checked={control.value.includes(option.value)}
              onBlur={control.field.handleBlur}
              aria-describedby={control.controlProps["aria-describedby"]}
              aria-invalid={control.controlProps["aria-invalid"]}
              onCheckedChange={(checked) =>
                control.field.handleChange(
                  checked === true
                    ? [
                        ...control.value.filter(
                          (value) => value !== option.value,
                        ),
                        option.value,
                      ]
                    : control.value.filter((value) => value !== option.value),
                )
              }
            />
            <Label
              htmlFor={`${control.id}-${index}`}
              className="flex min-h-11 flex-1 items-center text-sm font-normal"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </FieldFrame>
  );
}
