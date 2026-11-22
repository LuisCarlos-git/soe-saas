import { PageHeader } from "@soe/ui/components/page-header";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Settings } from "lucide-react";
import { Button } from "@soe/ui/primitives/button";
import type { ApiClient } from "@soe/api-client";
import { sessionQuery } from "../data/session";
export function AccountPage({ api }: { api: ApiClient }) {
  const { data } = useQuery(sessionQuery(api));
  return (
    <div className="soe-route-content">
      <PageHeader
        title="Seu espaço no SOE"
        description="Consulte seu perfil e cuide da segurança do seu acesso."
      />
      {data ? (
        <section
          aria-label="Identificação"
          className="mt-8 rounded-xl border border-rule bg-surface p-6 sm:p-8"
        >
          <h2 className="text-xl font-semibold">
            Olá, {data.name.split(" ")[0]}.
          </h2>
          <p className="mt-6 font-medium">{data.name}</p>
          <p className="mt-1 break-all text-sm text-muted-foreground">
            {data.email}
          </p>
          <p className="my-6 max-w-2xl leading-relaxed text-muted-foreground">
            Quando seu vínculo com uma escola estiver disponível, ele aparecerá
            aqui. Enquanto isso, confira seus dados e configure a proteção em
            duas etapas.
          </p>
          <Button
            asChild
            className="h-auto min-h-11 px-5 py-3 text-base font-semibold hover:bg-primary-hover"
          >
            <Link to="/settings/profile">
              <Settings className="size-4" aria-hidden="true" />
              Abrir configurações
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </section>
      ) : (
        <p role="alert" className="mt-6">
          Sessão indisponível.{" "}
          <Link to="/login" className="underline">
            Entrar novamente
          </Link>
        </p>
      )}
    </div>
  );
}
