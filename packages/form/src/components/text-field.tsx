import { InputField } from "@soe/ui";
import type { InputFieldProps } from "@soe/ui";
import { useFieldControl } from "../field-control";

export type TextFieldProps = Omit<
  InputFieldProps,
  "name" | "type" | "value" | "defaultValue" | "onChange" | "onBlur" | "error"
> & {
  type?:
    | "text"
    | "email"
    | "password"
    | "search"
    | "tel"
    | "url"
    | "date"
    | "datetime-local"
    | "time"
    | "month"
    | "week";
};

export function TextField(props: TextFieldProps) {
  const control = useFieldControl<string>(props);
  return (
    <InputField
      {...props}
      id={control.id}
      name={control.field.name}
      value={control.value}
      error={control.error}
      onBlur={control.field.handleBlur}
      onChange={(event) => control.field.handleChange(event.target.value)}
    />
  );
}
