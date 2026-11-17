import { lazyField } from "./lazy-field";
import type { TextareaFieldProps } from "./components/textarea-field";
import type { CheckboxFieldProps } from "./components/checkbox-field";
import type { SwitchFieldProps } from "./components/switch-field";
import type { SelectFieldProps } from "./components/select-field";
import type { NativeSelectFieldProps } from "./components/native-select-field";
import type { RadioGroupFieldProps } from "./components/radio-group-field";
import type { NumberFieldProps } from "./components/number-field";

export const TextareaField = lazyField<TextareaFieldProps>(() =>
  import("./components/textarea-field").then(({ TextareaField }) => ({
    default: TextareaField,
  })),
);
export const CheckboxField = lazyField<CheckboxFieldProps>(() =>
  import("./components/checkbox-field").then(({ CheckboxField }) => ({
    default: CheckboxField,
  })),
);
export const SwitchField = lazyField<SwitchFieldProps>(() =>
  import("./components/switch-field").then(({ SwitchField }) => ({
    default: SwitchField,
  })),
);
export const SelectField = lazyField<SelectFieldProps>(() =>
  import("./components/select-field").then(({ SelectField }) => ({
    default: SelectField,
  })),
);
export const NativeSelectField = lazyField<NativeSelectFieldProps>(() =>
  import("./components/native-select-field").then(({ NativeSelectField }) => ({
    default: NativeSelectField,
  })),
);
export const RadioGroupField = lazyField<RadioGroupFieldProps>(() =>
  import("./components/radio-group-field").then(({ RadioGroupField }) => ({
    default: RadioGroupField,
  })),
);
export const NumberField = lazyField<NumberFieldProps>(() =>
  import("./components/number-field").then(({ NumberField }) => ({
    default: NumberField,
  })),
);
