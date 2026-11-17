import { withForm } from "@soe/form";
import { loginFormOptions } from "../model/login-form-options";
import { loginFormSchema } from "../model/login-validation";

export const LoginFields = withForm({
  ...loginFormOptions,
  render: function LoginFields({ form }) {
    return (
      <div className="space-y-1">
        <form.AppField name="email">
          {(field) => (
            <field.TextField
              id="email"
              label="E-mail"
              type="email"
              autoComplete="username"
              required
              maxLength={loginFormSchema.shape.email.maxLength ?? undefined}
            />
          )}
        </form.AppField>
        <form.AppField name="password">
          {(field) => (
            <field.TextField
              id="password"
              label="Senha"
              type="password"
              autoComplete="current-password"
              required
              maxLength={loginFormSchema.shape.password.maxLength ?? undefined}
            />
          )}
        </form.AppField>
      </div>
    );
  },
});
