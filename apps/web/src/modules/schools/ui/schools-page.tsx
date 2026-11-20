import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ApiClient } from "@soe/api-client";
import { Button } from "@soe/ui";
import { SchoolCreationDialog } from "./school-creation-dialog";
import { SchoolBoundary } from "./school-boundary";

type Access = {
  canProvisionSchools: boolean;
  schools: { id: string; name: string }[];
};
export function SchoolsPage({
  api,
  actorId,
  access,
}: {
  api: ApiClient;
  actorId: string;
  access: Access;
}) {
  return (
    <section className="soe-route-content space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Minhas escolas
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
          Configure as escolas que você administra. Cada escola mantém sua
          própria equipe e histórico.
        </p>
      </header>
      <SchoolBoundary
        api={api}
        actorId={actorId}
        allowed={access.schools.length > 0}
      >
        <ul className="divide-y divide-rule rounded-xl border border-rule bg-surface">
          {access.schools.map((school) => (
            <li key={school.id}>
              <Link
                to="/schools/$organizationId/settings"
                params={{ organizationId: school.id }}
                className="flex min-h-16 items-center justify-between gap-4 rounded-lg px-5 py-4 text-primary focus-visible:outline-2 focus-visible:outline-primary"
              >
                <span className="min-w-0 break-words font-medium">
                  {school.name}
                </span>
                <span className="shrink-0 text-sm">Configurar</span>
              </Link>
            </li>
          ))}
        </ul>
      </SchoolBoundary>
    </section>
  );
}
export function PilotSchoolsPage({
  api,
  actorId,
  allowed,
}: {
  api: ApiClient;
  actorId: string;
  allowed: boolean;
}) {
  return (
    <section className="soe-route-content space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Escolas piloto
        </h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
          Provisione escolas para validar o SOE com dados sintéticos.
        </p>
      </header>
      <SchoolBoundary api={api} actorId={actorId} allowed={allowed}>
        <OperatorSchools api={api} actorId={actorId} />
      </SchoolBoundary>
    </section>
  );
}

function OperatorSchools({
  api,
  actorId,
}: {
  api: ApiClient;
  actorId: string;
}) {
  const [offset, setOffset] = useState(0);
  const query = useQuery({
    queryKey: ["operator-schools", actorId, offset],
    queryFn: ({ signal }) => api.schools(offset, signal),
    retry: false,
  });

  return (
    <section className="space-y-5" aria-label="Provisionamento de escolas">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-medium">Escolas cadastradas</h2>
        <SchoolCreationDialog
          api={api}
          actorId={actorId}
          onCreated={() => setOffset(0)}
        />
      </div>
      <p className="rounded-lg bg-primary/5 p-4 text-sm leading-relaxed">
        Ambiente de validação com dados sintéticos. Criar uma escola não
        autoriza a entrada de dados reais nem concede ao operador acesso ao
        conteúdo escolar.
      </p>
      {query.isPending ? (
        <p role="status">Carregando escolas…</p>
      ) : query.isError ? (
        <div>
          <p>Não foi possível carregar as escolas.</p>
          <Button
            className="mt-3"
            onClick={() => {
              void query.refetch();
            }}
          >
            Tentar novamente
          </Button>
        </div>
      ) : (
        <>
          {query.data.schools.length === 0 ? (
            <div className="rounded-xl border border-rule bg-surface p-6">
              <p className="font-medium">Nenhuma escola piloto por aqui</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Crie a primeira escola e indique quem administrará suas
                configurações.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-rule rounded-xl border border-rule bg-surface">
              {query.data.schools.map((school) => (
                <li key={school.id} className="space-y-2 p-5">
                  <h4 className="break-words font-medium">{school.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Ano letivo {school.academicYear} · {school.timeZone}
                  </p>
                  <p className="break-words text-sm text-muted-foreground">
                    Responsável: {school.initialAdministrator.name} (
                    {school.initialAdministrator.email})
                  </p>
                </li>
              ))}
            </ul>
          )}
          {(offset > 0 || query.data.hasMore) && (
            <nav
              aria-label="Páginas de escolas"
              className="flex justify-end gap-3"
            >
              <Button
                variant="outline"
                disabled={offset === 0}
                onClick={() => setOffset((value) => Math.max(0, value - 20))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                disabled={!query.data.hasMore}
                onClick={() => setOffset((value) => value + 20)}
              >
                Próxima
              </Button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
