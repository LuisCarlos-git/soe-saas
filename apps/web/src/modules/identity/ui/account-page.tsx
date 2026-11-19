import { MfaSettings } from "./mfa-settings";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Button } from "@soe/ui";
import type { ApiClient } from "@soe/api-client";
import { sessionQuery } from "../data/session";
export function AccountPage({ api }: { api: ApiClient }) {
  const { data } = useQuery(sessionQuery(api));
  const client = useQueryClient();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function logout() {
    setPending(true);
    try {
      await api.logout();
      await client.cancelQueries();
      client.clear();
      await router.navigate({ to: "/login" });
    } catch {
      // The HTTP client reports errors through the global toast adapter.
    } finally {
      setPending(false);
    }
  }
  return (
    <main className="min-h-screen bg-canvas px-6 py-12 text-ink">
      <div className="mx-auto max-w-3xl">
        <p className="text-xl font-semibold text-primary">SOE</p>
        <h1 className="mt-8 text-3xl font-semibold">Sua sessão</h1>
        {data ? (
          <section
            className="mt-6 rounded-xl border border-rule bg-surface p-6"
            aria-label="Identificação"
          >
            <p className="text-lg font-medium">{data.name}</p>
            <p className="mt-2 break-all text-muted-foreground">{data.email}</p>
            <p className="my-6 text-muted-foreground">
              O acesso às escolas será disponibilizado nas próximas etapas.
            </p>
            <Button
              loading={pending}
              onClick={() => {
                void logout();
              }}
            >
              Sair
            </Button>
            <MfaSettings api={api} />
          </section>
        ) : (
          <p role="alert" className="mt-6">
            Sessão indisponível.{" "}
            <a className="underline" href="/login">
              Entrar novamente
            </a>
          </p>
        )}
      </div>
    </main>
  );
}
