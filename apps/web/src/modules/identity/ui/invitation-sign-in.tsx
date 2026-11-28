import { useState } from "react";
import type { ApiClient } from "@soe/api-client";
import { useAppForm } from "@soe/form";
import { loginFormOptions } from "../model/login-form-options";
import { MfaVerification } from "./mfa-verification";

export function InvitationSignIn({
  api,
  email,
  onAuthenticated,
}: {
  api: ApiClient;
  email: string;
  onAuthenticated: () => Promise<void>;
}) {
  const [challenge, setChallenge] = useState(false);
  const form = useAppForm({
    ...loginFormOptions,
    defaultValues: { email, password: "" },
    onSubmit: async ({ value }) => {
      try {
        const result = await api.login(value);
        form.reset();
        if (result.twoFactorRedirect) setChallenge(true);
        else await onAuthenticated();
      } catch {
        form.reset();
      }
    },
  });
  if (challenge)
    return (
      <MfaVerification
        api={api}
        onVerified={onAuthenticated}
        onCancel={() => setChallenge(false)}
      />
    );
  return (
    <form.AppForm>
      <form
        method="post"
        noValidate
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.AppField name="email">
          {(field) => (
            <field.TextField
              label="E-mail do convite"
              type="email"
              autoComplete="username"
              readOnly
              reserveErrorSpace={false}
            />
          )}
        </form.AppField>
        <form.AppField name="password">
          {(field) => (
            <field.TextField
              label="Senha"
              type="password"
              autoComplete="current-password"
              required
              maxLength={128}
              reserveErrorSpace={false}
            />
          )}
        </form.AppField>
        <form.SubmitButton className="w-full">
          Entrar para continuar
        </form.SubmitButton>
      </form>
    </form.AppForm>
  );
}
