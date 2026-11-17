import { formOptions, validateOnChangeAndBlur } from "@soe/form";
import { loginFormSchema } from "./login-validation";

export const loginFormOptions = formOptions({
  defaultValues: { email: "", password: "" },
  validationLogic: validateOnChangeAndBlur,
  validators: { onChange: loginFormSchema },
});
