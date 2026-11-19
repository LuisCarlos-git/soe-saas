import { InputField } from "@soe/ui";
import type { InputFieldProps } from "@soe/ui";
import { useFieldControl } from "../field-control";

export type NumberFieldProps = Omit<
  InputFieldProps,
  "name" | "type" | "value" | "defaultValue" | "onChange" | "onBlur" | "error"
>;

export function NumberField(props: NumberFieldProps) {
  const control = useFieldControl<number | null>(props);
  return (
    <InputField
      {...props}
      id={control.id}
      name={control.field.name}
      type="number"
      value={control.value ?? ""}
      error={control.error}
      onBlur={control.field.handleBlur}
      onChange={(event) => {
        const number = event.target.valueAsNumber;
        if (!Number.isFinite(number)) {
          control.field.handleChange(null);
          return;
        }
        control.field.handleChange(number);
      }}
    />
  );
}
