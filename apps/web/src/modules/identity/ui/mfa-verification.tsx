import { useEffect, useRef } from "react";
import { useAppForm, validateOnChangeAndBlur } from "@soe/form";
import { Button } from "@soe/ui";
import { mfaVerificationSchema } from "@soe/contracts";
import type { ApiClient } from "@soe/api-client";
export function MfaVerification({
  api,
  onVerified,
  onCancel,
}: {
  api: ApiClient;
  onVerified: () => Promise<void>;
  onCancel: () => void;
}) {
  const section = useRef<HTMLDivElement>(null);
  useEffect(() => {
    section.current?.querySelector("input")?.focus();
  }, []);
  const form = useAppForm({
    defaultValues: { code: "" },
    validationLogic: validateOnChangeAndBlur,
    validators: { onChange: mfaVerificationSchema },
    onSubmit: async ({ value }) => {
      try {
        await api.verifyMfa(value);
        form.reset();
        await onVerified();
      } catch {
        form.reset();
      }
    },
  });
  return (
    <div ref={section} className="mt-6 space-y-4">
      <p className="text-muted-foreground">
        Informe o código de seis dígitos do seu aplicativo autenticador.
      </p>
      <form.AppForm>
        <form
          noValidate
          method="post"
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.AppField name="code">
            {(field) => (
              <field.TextField
                label="Código do aplicativo"
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                required
              />
            )}
          </form.AppField>
          <form.SubmitButton className="w-full">
            Verificar código
          </form.SubmitButton>
        </form>
      </form.AppForm>
      <Button variant="outline" onClick={onCancel}>
        Voltar
      </Button>
      <p className="text-sm text-muted-foreground">
        Sem acesso ao aplicativo? Procure o responsável pelo piloto. A
        recuperação de conta ainda não está disponível.
      </p>
    </div>
  );
}
