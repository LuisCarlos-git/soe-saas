import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppForm, validateOnChangeAndBlur } from "@soe/form";
import { mfaEnrollmentFormSchema } from "../model/mfa-validation";
import type { ApiClient } from "@soe/api-client";
import { MfaVerification } from "./mfa-verification";
export function MfaSettings({ api }: { api: ApiClient }) {
  const client = useQueryClient();
  const [uri, setUri] = useState<string | null>(null);
  const state = useQuery({
    queryKey: ["identity", "mfa"],
    queryFn: () => api.mfaStatus(),
    retry: false,
    staleTime: 0,
  });
  const form = useAppForm({
    defaultValues: { password: "" },
    validationLogic: validateOnChangeAndBlur,
    validators: { onChange: mfaEnrollmentFormSchema },
    onSubmit: async ({ value }) => {
      try {
        const data = await api.enrollMfa(value);
        form.reset();
        setUri(data.totpURI);
      } catch {
        form.reset();
      }
    },
  });
  return (
    <section
      className="mt-8 border-t border-rule pt-8"
      aria-labelledby="mfa-title"
    >
      <h2 id="mfa-title" className="text-2xl font-semibold">
        Proteção em duas etapas
      </h2>
      <p className="mt-3 text-muted-foreground">
        O aplicativo autenticador protege o acesso à administração e às
        informações restritas da escola.
      </p>
      {state.isPending ? (
        <p role="status" className="mt-4">
          Verificando proteção…
        </p>
      ) : state.isError ? (
        <p role="alert" className="mt-4">
          Não foi possível verificar a proteção. Recarregue a página para tentar
          novamente.
        </p>
      ) : state.data.verified ? (
        <p role="status" className="mt-4 font-medium text-primary">
          Proteção ativa nesta sessão.
        </p>
      ) : state.data.enabled ? (
        <>
          <p className="mt-4">Esta sessão ainda não foi verificada.</p>
          <MfaVerification
            api={api}
            onVerified={async () => {
              await client.invalidateQueries({ queryKey: ["identity"] });
            }}
            onCancel={() => {
              window.location.assign("/login");
            }}
          />
        </>
      ) : uri ? (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium">Conecte seu aplicativo</h3>
          <p className="text-muted-foreground">
            No aplicativo autenticador, adicione uma conta com chave de
            configuração e escolha códigos baseados em tempo. Digite a chave
            abaixo e confirme o primeiro código.
          </p>
          <p className="text-sm font-medium">Chave de configuração</p>
          <code className="block break-all rounded-lg border border-rule bg-surface p-4 select-all">
            {new URL(uri).searchParams.get("secret")}
          </code>
          <p className="text-sm text-muted-foreground">
            Guarde a chave somente no aplicativo. Ela desaparece ao sair desta
            tela. A proteção só será ativada após verificar o código.
          </p>
          <MfaVerification
            api={api}
            onVerified={async () => {
              setUri(null);
              await client.invalidateQueries({ queryKey: ["identity"] });
            }}
            onCancel={() => setUri(null)}
          />
        </div>
      ) : (
        <form.AppForm>
          <form
            noValidate
            method="post"
            className="mt-6 max-w-md space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void form.handleSubmit();
            }}
          >
            <form.AppField name="password">
              {(field) => (
                <field.TextField
                  label="Confirme sua senha"
                  type="password"
                  autoComplete="current-password"
                  maxLength={128}
                  required
                />
              )}
            </form.AppField>
            <form.SubmitButton>Configurar aplicativo</form.SubmitButton>
          </form>
        </form.AppForm>
      )}
    </section>
  );
}
