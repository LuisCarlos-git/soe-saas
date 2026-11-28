import { SchoolDirectory } from "./school-directory";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ApiClient } from "@soe/api-client";
import { Button } from "@soe/ui";
import { PageToolbar } from "@soe/ui/components/page-toolbar";
import { SchoolCreationDialog } from "./school-creation-dialog";
import { SchoolBoundary } from "./school-boundary";

export function SchoolsPage({
  api,
  actorId,
}: {
  api: ApiClient;
  actorId: string;
}) {
  return <SchoolDirectory api={api} actorId={actorId} />;
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
      <PageToolbar
        description="Provisione escolas para validar o SOE com dados sintéticos."
        actions={
          <SchoolCreationDialog
            api={api}
            actorId={actorId}
            onCreated={() => setOffset(0)}
          />
        }
      />
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
