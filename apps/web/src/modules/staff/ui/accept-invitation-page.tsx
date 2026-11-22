import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError, type ApiClient } from "@soe/api-client";
import {
  invitationPreviewSchema,
  identitySchema,
  mfaStatusSchema,
  registerInvitedIdentitySchema,
} from "@soe/contracts";
import type { z } from "zod";
import { useAppForm, validateOnChangeAndBlur } from "@soe/form";
import { Button } from "@soe/ui";
import { Badge } from "@soe/ui/primitives/badge";
import { Check, School } from "lucide-react";
import { roleLabel } from "../model/roles";

type Preview = z.infer<typeof invitationPreviewSchema>;
type Identity = z.infer<typeof identitySchema>;
type Mfa = z.infer<typeof mfaStatusSchema>;

export function AcceptInvitationPage({
  api,
  renderSignIn,
  renderMfa,
}: {
  api: ApiClient;
  renderSignIn: (email: string, complete: () => Promise<void>) => ReactNode;
  renderMfa: (complete: () => Promise<void>) => ReactNode;
}) {
  const client = useQueryClient();
  const [token, setToken] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [mfa, setMfa] = useState<Mfa | null>(null);
  const [state, setState] = useState<
    "loading" | "ready" | "invalid" | "error" | "accepted"
  >("loading");
  const [busy, setBusy] = useState(false);
  const refreshIdentity = useCallback(async () => {
    await client.cancelQueries();
    client.clear();
    const current = await api.identity();
    setIdentity(current);
    setMfa(current ? await api.mfaStatus() : null);
  }, [api, client]);
  const load = useCallback(
    async (secret: string, signal?: AbortSignal) => {
      setState("loading");
      try {
        const data = await api.previewInvitation(secret, signal);
        const current = await api.identity(signal);
        const protection = current ? await api.mfaStatus() : null;
        if (signal?.aborted) return;
        setPreview(data);
        setIdentity(current);
        setMfa(protection);
        setState("ready");
      } catch (error) {
        if (signal?.aborted) return;
        setState(
          error instanceof ApiError && error.status === 410
            ? "invalid"
            : "error",
        );
      }
    },
    [api],
  );
  useEffect(() => {
    // Capability stays in the fragment and component memory, never query/cache/storage.
    let controller: AbortController | undefined;
    function readFragment() {
      controller?.abort();
      const secret = window.location.hash.slice(1);
      setToken(secret);
      if (!/^[A-Za-z0-9_-]{43}$/.test(secret)) {
        setPreview(null);
        setState("invalid");
        return;
      }
      controller = new AbortController();
      void load(secret, controller.signal);
    }
    readFragment();
    window.addEventListener("hashchange", readFragment);
    return () => {
      controller?.abort();
      window.removeEventListener("hashchange", readFragment);
    };
  }, [load]);
  async function accept() {
    if (busy) return;
    setBusy(true);
    try {
      await api.acceptInvitation(token);
      await client.cancelQueries();
      client.clear();
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname,
      );
      setToken("");
      setState("accepted");
    } catch (error) {
      if (error instanceof ApiError && error.status === 410)
        setState("invalid");
      else if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      )
        await refreshIdentity().catch(() => {});
    } finally {
      setBusy(false);
    }
  }
  const content =
    state === "loading" ? (
      <p role="status">Verificando convite…</p>
    ) : state === "invalid" ? (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Convite indisponível</h1>
        <p className="leading-relaxed text-muted-foreground">
          Abra o link completo recebido por e-mail. Se o convite expirou ou já
          foi usado, peça um novo convite à escola.
        </p>
        <Link
          to="/login"
          className="inline-flex min-h-11 items-center font-medium text-primary underline underline-offset-4"
        >
          Ir para o login
        </Link>
      </div>
    ) : state === "error" ? (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">
          Não foi possível abrir o convite
        </h1>
        <p className="text-muted-foreground">
          Confira a conexão e tente novamente.
        </p>
        <Button onClick={() => void load(token)}>Tentar novamente</Button>
      </div>
    ) : state === "accepted" ? (
      <div className="space-y-4">
        <Check className="size-9 text-primary" aria-hidden="true" />
        <h1 className="text-2xl font-semibold">Convite aceito</h1>
        <p className="leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
          Seu vínculo com {preview?.schoolName} foi criado. Os papéis valem
          somente para esta escola.
        </p>
        <Link
          to="/account"
          className="inline-flex min-h-11 items-center font-medium text-primary underline underline-offset-4"
        >
          Abrir minha conta
        </Link>
      </div>
    ) : preview ? (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Convite para a equipe
          </h1>
          <p className="mt-3 text-lg font-medium leading-7 [overflow-wrap:anywhere]">
            {preview.schoolName}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Convite para
            <span className="block font-medium text-ink [overflow-wrap:anywhere]">
              {preview.email}
            </span>
          </p>
        </header>
        <div className="space-y-2 border-y border-rule py-4">
          <p className="text-sm font-medium">Papéis nesta escola</p>
          <ul className="flex flex-wrap gap-2" aria-label="Papéis do convite">
            {preview.roles.map((role) => (
              <li key={role} className="min-w-0 max-w-full">
                <Badge
                  variant="secondary"
                  className="max-w-full whitespace-normal rounded-md bg-canvas px-2 py-1 text-ink [overflow-wrap:anywhere]"
                >
                  {roleLabel(role)}
                </Badge>
              </li>
            ))}
          </ul>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Administração e direção não liberam acesso automático a relatos
            restritos.
          </p>
        </div>
        {!identity ? (
          preview.registrationRequired ? (
            <Registration
              api={api}
              token={token}
              preview={preview}
              onAuthenticated={refreshIdentity}
              renderSignIn={renderSignIn}
              onUnavailable={() => setState("invalid")}
            />
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Entre para aceitar</h2>
              {renderSignIn(preview.email, refreshIdentity)}
            </div>
          )
        ) : identity.email.toLowerCase() !== preview.email.toLowerCase() ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Use a conta do convite</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Você está conectado como{" "}
              <span className="font-medium text-ink [overflow-wrap:anywhere]">
                {identity.email}
              </span>
              . Este convite é para outra conta.
            </p>
            <Button
              variant="outline"
              loading={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await api.logout();
                  await refreshIdentity();
                } catch {
                  /* Global toast. */
                } finally {
                  setBusy(false);
                }
              }}
            >
              Trocar de conta
            </Button>
          </div>
        ) : preview.roles.includes("SCHOOL_ADMIN") && !mfa?.verified ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              Proteja o acesso administrativo
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Configure ou verifique seu aplicativo autenticador para continuar
              com este convite.
            </p>
            {renderMfa(refreshIdentity)}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Ao aceitar, sua conta será vinculada somente à escola indicada
              acima, com os papéis deste convite.
            </p>
            <Button
              className="w-full"
              loading={busy}
              onClick={() => void accept()}
            >
              Aceitar convite
            </Button>
          </div>
        )}
        <footer className="space-y-1 border-t border-rule pt-4 text-xs leading-5 text-muted-foreground">
          <p>Convite de uso único</p>
          <p>
            Válido até{" "}
            <time
              dateTime={preview.expiresAt}
              className="whitespace-nowrap font-medium text-ink"
            >
              {new Intl.DateTimeFormat("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
                timeZone: preview.timeZone,
              }).format(new Date(preview.expiresAt))}
            </time>
          </p>
          <p>Horário da escola.</p>
        </footer>
      </div>
    ) : null;
  return (
    <main className="min-h-svh bg-canvas px-4 py-8 text-ink sm:py-12">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-6 flex items-center gap-3 font-semibold text-primary">
          <School className="size-6" aria-hidden="true" />
          SOE
        </div>
        <section className="min-w-0 rounded-xl border border-rule bg-surface p-5 sm:p-8">
          {content}
        </section>
      </div>
    </main>
  );
}

function Registration({
  api,
  token,
  preview,
  onAuthenticated,
  renderSignIn,
  onUnavailable,
}: {
  api: ApiClient;
  token: string;
  preview: Preview;
  onAuthenticated: () => Promise<void>;
  renderSignIn: (email: string, complete: () => Promise<void>) => ReactNode;
  onUnavailable: () => void;
}) {
  const [registered, setRegistered] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const form = useAppForm({
    defaultValues: { name: preview.name, password: "" },
    validationLogic: validateOnChangeAndBlur,
    validators: {
      onChange: registerInvitedIdentitySchema.pick({
        name: true,
        password: true,
      }),
    },
    onSubmit: async ({ value }) => {
      try {
        await api.registerInvitation({ token, ...value });
        setRegistered(true);
        setConnecting(true);
        form.reset();
        await api.login({ email: preview.email, password: value.password });
        await onAuthenticated();
      } catch (error) {
        if (error instanceof ApiError && error.status === 409)
          setRegistered(true);
        if (error instanceof ApiError && error.status === 410) onUnavailable();
        /* A created account can sign in without repeating registration. */
      } finally {
        setConnecting(false);
      }
    },
  });
  if (connecting) return <p role="status">Conectando sua conta…</p>;
  if (registered)
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Conta criada. Entre para continuar.
        </h2>
        {renderSignIn(preview.email, onAuthenticated)}
      </div>
    );
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Crie seu acesso</h2>
      <p className="text-sm text-muted-foreground">
        A conta será criada para o e-mail deste convite.
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
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Seu nome"
                autoComplete="name"
                required
                maxLength={160}
                reserveErrorSpace={false}
              />
            )}
          </form.AppField>
          <form.AppField name="password">
            {(field) => (
              <field.TextField
                label="Crie uma senha"
                type="password"
                autoComplete="new-password"
                required
                maxLength={128}
                description="Use pelo menos 8 caracteres."
                reserveErrorSpace={false}
              />
            )}
          </form.AppField>
          <form.SubmitButton className="w-full">
            Criar conta e entrar
          </form.SubmitButton>
        </form>
      </form.AppForm>
    </div>
  );
}
