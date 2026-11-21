import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "./context";
import { TextField } from "./components/text-field";
import { SubmitButton } from "./components/submit-button";
import {
  TextareaField,
  CheckboxField,
  CheckboxGroupField,
  SwitchField,
  SelectField,
  NativeSelectField,
  RadioGroupField,
  NumberField,
} from "./lazy-fields";

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    TextareaField,
    CheckboxField,
    CheckboxGroupField,
    SwitchField,
    SelectField,
    NativeSelectField,
    RadioGroupField,
    NumberField,
  },
  formComponents: { SubmitButton },
});
