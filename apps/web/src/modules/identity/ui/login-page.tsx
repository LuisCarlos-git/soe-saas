import { useState } from "react";
import { MfaDialog } from "./mfa-dialog";
import { MfaVerification } from "./mfa-verification";
import { useAppForm } from "@soe/form";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useHydrated } from "@tanstack/react-router";
import type { ApiClient } from "@soe/api-client";
import { loginFormOptions } from "../model/login-form-options";
import { LoginFields } from "./login-fields";

export function LoginPage({ api }: { api: ApiClient }) {
  const [challenge, setChallenge] = useState(false);
  const hydrated = useHydrated();
  const client = useQueryClient();
  const router = useRouter();
  const form = useAppForm({
    ...loginFormOptions,
    onSubmit: async ({ value }) => {
      try {
        const result = await api.login(value);
        form.reset();
        if (result.twoFactorRedirect) {
          setChallenge(true);
          return;
        }
        await client.cancelQueries();
        client.clear();
        await router.navigate({ to: "/account" });
      } catch {
        // The HTTP client reports errors through the global toast adapter.
      }
    },
  });
  return (
    <main
      id="main-content"
      className="flex min-h-svh items-center justify-center bg-surface bg-linear-to-b from-primary/10 via-primary/5 to-surface p-4 text-ink sm:p-6 lg:p-8"
    >
      <a
        href="#login-title"
        className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-50 focus:rounded-lg focus:bg-surface focus:p-3"
      >
        Ir para o acesso
      </a>
      <div className="login-shell relative grid w-full max-w-[1600px] lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[1.1fr_1fr]">
        <section
          aria-labelledby="welcome-title"
          className="relative flex flex-col px-7 pb-8 pt-7 sm:px-12 sm:pt-10 lg:pb-10"
        >
          <div className="relative flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-sm font-semibold tracking-tight text-white">
              SOE
            </span>
            <span className="text-sm font-medium leading-snug text-muted-foreground">
              Orientação e<br />
              acompanhamento educacional
            </span>
          </div>
          <div className="relative mt-8 max-w-md lg:mt-14">
            <h1
              id="welcome-title"
              className="text-2xl font-semibold leading-[1.15] tracking-tight sm:text-4xl lg:text-[42px]"
            >
              Cada estudante,
              <br />
              <span className="text-primary">um cuidado contínuo.</span>
            </h1>
            <p className="mt-5 hidden max-w-sm text-base leading-relaxed text-muted-foreground sm:block">
              Registros, próximos passos e equipe conectados para acompanhar
              cada trajetória.
            </p>
          </div>
          <div className="relative mt-8 hidden w-full overflow-hidden rounded-2xl lg:block">
            <img
              src="/images/classroom-reading-realistic.jpg"
              alt=""
              aria-hidden="true"
              width={1000}
              height={800}
              decoding="async"
              className="soe-classroom-illustration aspect-[5/4] max-h-[44svh] w-full object-cover object-[center_35%]"
            />
          </div>
          <p className="relative mt-auto hidden pt-4 text-xs text-muted-foreground lg:block">
            Um espaço de trabalho da equipe escolar.
          </p>
        </section>
        <div className="flex items-center justify-center p-4 pt-0 sm:p-8 lg:py-12 lg:pl-0 lg:pr-10">
          <section
            aria-labelledby="login-title"
            className="w-full max-w-[520px] rounded-[20px] border border-rule/70 bg-canvas px-6 py-9 sm:px-10 sm:py-12 lg:py-14"
          >
            <p className="mb-3 text-sm font-medium text-primary">
              Bem-vindo de volta
            </p>
            <h2
              id="login-title"
              tabIndex={-1}
              className="text-2xl sm:text-3xl font-semibold tracking-tight"
            >
              Entrar na plataforma
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Use o acesso fornecido pela equipe responsável.
            </p>
            <form.AppForm>
              <form
                noValidate
                method="post"
                className="mt-8 space-y-6"
                onSubmit={(event) => {
                  event.preventDefault();
                  void form.handleSubmit();
                }}
              >
                <LoginFields form={form} />
                <form.SubmitButton disabled={!hydrated} className="w-full">
                  Entrar
                </form.SubmitButton>
              </form>
            </form.AppForm>

            <MfaDialog
              open={challenge}
              onOpenChange={setChallenge}
              title="Verifique seu acesso"
              description="Confirme sua identidade com o aplicativo autenticador."
              onCloseFocus={() => document.getElementById("email")?.focus()}
            >
              <MfaVerification
                api={api}
                onVerified={async () => {
                  setChallenge(false);
                  await client.cancelQueries();
                  client.clear();
                  await router.navigate({ to: "/account" });
                }}
                onCancel={() => setChallenge(false)}
              />
            </MfaDialog>
            <div className="mt-8 border-t border-rule pt-6">
              <p className="text-sm font-medium text-ink">Precisa de acesso?</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Fale com o responsável pela plataforma na sua escola.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
