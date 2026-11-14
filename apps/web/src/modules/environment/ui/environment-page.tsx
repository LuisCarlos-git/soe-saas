import { useQuery } from "@tanstack/react-query";
import { CircleAlert, CircleCheck, RefreshCw } from "lucide-react";
import { Button } from "@soe/ui";
import type { ApiClient } from "@soe/api-client";
import { environmentQuery } from "../data/query";

export function EnvironmentPage({ api }: { api: ApiClient }) {
  const result = useQuery(environmentQuery(api));
  const checking = result.isFetching;
  const healthy = result.isSuccess && !result.isError && !result.isPaused;
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:block focus:p-4"
      >
        Pular para o conteúdo
      </a>
      <header className="border-b border-rule bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5 sm:px-8">
          <span className="text-xl font-semibold tracking-tight">SOE</span>
          <span className="text-sm text-muted">
            Ambiente de desenvolvimento
          </span>
        </div>
      </header>
      <main
        id="conteudo"
        className="mx-auto max-w-5xl px-6 py-12 sm:px-8 sm:py-16"
      >
        <h1 className="text-3xl font-semibold tracking-tight">
          Verificação do ambiente
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Confirme que a aplicação consegue consultar um registro sintético.
          Esta verificação não acessa informações de estudantes.
        </p>
        <section
          aria-labelledby="resultado"
          className="mt-10 max-w-3xl rounded-xl border border-rule bg-surface p-6 sm:p-8"
        >
          <h2 id="resultado" className="text-xl font-semibold">
            Resultado da consulta
          </h2>
          <div
            role="status"
            aria-live="polite"
            aria-busy={checking}
            className="mt-6"
          >
            <ConnectionResult
              checking={checking}
              healthy={healthy}
              paused={result.isPaused}
              sample={result.data?.sample}
            />
          </div>
          <div className="mt-8">
            <Button
              disabled={checking}
              onClick={() => {
                void result.refetch();
              }}
            >
              <RefreshCw aria-hidden="true" className="size-4" />
              Verificar novamente
            </Button>
          </div>
        </section>
        <aside className="mt-8 max-w-2xl text-sm leading-relaxed text-muted">
          <p>
            Use apenas dados sintéticos neste ambiente. O acesso por escolas e
            as permissões de acompanhamento serão entregues nas próximas etapas.
          </p>
        </aside>
      </main>
    </div>
  );
}

function ConnectionResult({
  checking,
  healthy,
  paused,
  sample,
}: {
  checking: boolean;
  healthy: boolean;
  paused: boolean;
  sample: string | undefined;
}) {
  if (checking) return <p className="text-muted">Verificando a conexão…</p>;
  if (healthy)
    return (
      <>
        <p className="flex items-center gap-3 font-semibold text-positive">
          <CircleCheck aria-hidden="true" className="size-5 shrink-0" />
          Conexão verificada
        </p>
        <p className="mt-3 leading-relaxed text-muted">{sample}</p>
      </>
    );
  let message =
    "Confira se os serviços locais estão disponíveis e tente novamente.";
  if (paused)
    message = "Sem conexão com a rede. Reconecte para verificar novamente.";
  return (
    <>
      <p className="flex items-center gap-3 font-semibold text-negative">
        <CircleAlert aria-hidden="true" className="size-5 shrink-0" />
        Não foi possível verificar a conexão
      </p>
      <p className="mt-3 leading-relaxed text-muted">{message}</p>
    </>
  );
}
