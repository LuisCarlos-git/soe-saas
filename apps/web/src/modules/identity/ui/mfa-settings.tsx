import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppForm, validateOnChangeAndBlur } from "@soe/form";
import { Button } from "@soe/ui";
import { useStepFlow } from "@soe/ui/hooks/use-step-flow";
import { StepFlowContent } from "@soe/ui/components/step-flow-content";
import { ChevronDown, KeyRound } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { mfaEnrollmentFormSchema } from "../model/mfa-validation";
import type { ApiClient } from "@soe/api-client";
import { MfaVerification } from "./mfa-verification";
import { MfaDialog } from "./mfa-dialog";

type EnrollmentStep = "password" | "scan" | "verify";
const enrollmentFlow = {
  password: { next: ["scan"] },
  scan: { next: ["verify"] },
  verify: { next: [] },
} as const;

function MfaEnrollment({
  api,
  onVerified,
}: {
  api: ApiClient;
  onVerified: () => Promise<void>;
}) {
  // Enrollment material belongs only to this mounted dialog, never a query cache.
  const [uri, setUri] = useState<string | null>(null);
  const navigation = useStepFlow<EnrollmentStep>({
    flow: enrollmentFlow,
    initialStep: "password",
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
        navigation.goTo("scan");
      } catch {
        form.reset();
      }
    },
  });
  return (
    <StepFlowContent navigation={navigation}>
      {navigation.currentStep === "verify" ? (
        <MfaVerification
          api={api}
          onVerified={onVerified}
          onCancel={() => {
            navigation.back();
          }}
          cancelLabel="Voltar ao QR code"
        />
      ) : navigation.currentStep === "scan" && uri ? (
        <div className="space-y-4">
          <div>
            <h3
              data-step-focus
              tabIndex={-1}
              className="text-lg font-medium outline-none"
            >
              Conecte seu aplicativo
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Escaneie o QR code no aplicativo autenticador. A conta aparecerá
              como SOe.
            </p>
          </div>
          <div className="flex justify-center">
            <QRCodeSVG
              value={uri}
              size={208}
              marginSize={4}
              level="M"
              title="QR code para configurar SOe no aplicativo autenticador"
              className="max-w-full"
            />
          </div>
          <details className="group rounded-lg border border-rule p-3 text-sm">
            <summary className="flex cursor-pointer list-none items-center gap-3 rounded-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
              <KeyRound
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span className="flex-1">Não consegue escanear?</span>
              <ChevronDown
                className="size-4 shrink-0 text-muted-foreground group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Adicione uma conta chamada SOe, escolha códigos baseados em tempo
              e use esta chave:
            </p>
            <code className="mt-3 block select-all break-all rounded-lg bg-canvas p-3">
              {new URL(uri).searchParams.get("secret")}
            </code>
          </details>
          <Button
            className="w-full"
            onClick={() => {
              navigation.next();
            }}
          >
            Já adicionei ao aplicativo
          </Button>
        </div>
      ) : (
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
            <form.SubmitButton className="w-full">Continuar</form.SubmitButton>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A proteção só será ativada depois que você confirmar o primeiro
              código do aplicativo.
            </p>
          </form>
        </form.AppForm>
      )}
    </StepFlowContent>
  );
}

export function MfaSettings({ api }: { api: ApiClient }) {
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const state = useQuery({
    queryKey: ["identity", "mfa"],
    queryFn: () => api.mfaStatus(),
    retry: false,
    staleTime: 0,
  });
  async function complete() {
    setOpen(false);
    await client.invalidateQueries({ queryKey: ["identity"] });
  }
  return (
    <section
      className="rounded-xl border border-rule bg-surface p-6 sm:p-8"
      aria-labelledby="mfa-title"
    >
      <h2 id="mfa-title" className="text-xl font-semibold">
        Proteção em duas etapas
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
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
      ) : (
        <>
          {state.data.enabled && (
            <p className="mt-4">Esta sessão ainda não foi verificada.</p>
          )}
          <MfaDialog
            open={open}
            onOpenChange={setOpen}
            title={
              state.data.enabled
                ? "Verifique seu acesso"
                : "Configurar proteção em duas etapas"
            }
            description={
              state.data.enabled
                ? "Confirme sua identidade com o aplicativo autenticador."
                : "Conecte um aplicativo autenticador para proteger seu acesso ao SOe."
            }
            trigger={
              <Button className="mt-6">
                {state.data.enabled
                  ? "Verificar acesso"
                  : "Configurar aplicativo"}
              </Button>
            }
          >
            {state.data.enabled ? (
              <MfaVerification
                api={api}
                onVerified={complete}
                onCancel={() => setOpen(false)}
              />
            ) : (
              <MfaEnrollment api={api} onVerified={complete} />
            )}
          </MfaDialog>
        </>
      )}
    </section>
  );
}
