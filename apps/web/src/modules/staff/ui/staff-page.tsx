import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiClient } from "@soe/api-client";
import type { InvitationListQuery } from "@soe/contracts";
import { Button } from "@soe/ui";
import { buttonVariants } from "@soe/ui/primitives/button";
import { ArrowLeft, ChevronRight, Mail, RefreshCw } from "lucide-react";
import { InvitationDialog } from "./invitation-dialog";
import { InvitationFilters } from "./invitation-filters";
import { InvitationTable } from "./invitation-table";
import { PageHeader } from "@soe/ui/components/page-header";
import {
  staffInvitationsKey,
  staffInvitationsQuery,
  staffSchoolQuery,
} from "../data/queries";

export function StaffSchoolsPage({
  schools,
}: {
  schools: { id: string; name: string }[];
}) {
  return (
    <section className="soe-route-content space-y-6">
      <PageHeader
        title="Profissionais"
        description="Escolha a escola para convidar profissionais e acompanhar os convites da equipe."
      />
      <ul className="divide-y divide-rule rounded-xl border border-rule bg-surface">
        {schools.map((school) => (
          <li key={school.id}>
            <Link
              to="/schools/$organizationId/professionals"
              params={{ organizationId: school.id }}
              className="flex min-h-16 items-center justify-between gap-4 rounded-lg px-5 py-4 font-medium text-primary focus-visible:outline-2 focus-visible:outline-primary"
            >
              <span className="min-w-0 break-words">{school.name}</span>
              <ChevronRight className="size-5 shrink-0" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function StaffPage({
  api,
  actorId,
  school,
}: {
  api: ApiClient;
  actorId: string;
  school: { id: string; name: string };
}) {
  const client = useQueryClient();
  const [options, setOptions] = useState<InvitationListQuery>({
    offset: 0,
    limit: 10,
    search: "",
    sortBy: "createdAt",
    sortDirection: "desc",
  });
  const settings = useQuery(staffSchoolQuery(api, actorId, school.id));
  const query = useQuery(
    staffInvitationsQuery(api, actorId, school.id, options),
  );
  return (
    <section className="soe-route-content space-y-6">
      <PageHeader
        title="Convites da equipe"
        description={school.name}
        back={
          <Link
            to="/schools/professionals"
            aria-label="Escolher outra escola"
            title="Escolher outra escola"
            className={buttonVariants({
              variant: "ghost",
              size: "icon",
              className: "size-11 text-muted-foreground",
            })}
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Link>
        }
        actions={
          <>
            <Button
              variant="outline"
              size="icon"
              className="size-11 p-0"
              aria-label="Atualizar lista"
              title="Atualizar lista"
              loading={query.isFetching && !query.isPending}
              onClick={() => {
                void query.refetch();
                void settings.refetch();
              }}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
            </Button>
            {!query.isError && !settings.isError && (
              <InvitationDialog
                api={api}
                school={school}
                onSent={async () => {
                  setOptions((value) => ({ ...value, offset: 0 }));
                  await client.invalidateQueries({
                    queryKey: staffInvitationsKey(actorId, school.id),
                  });
                }}
              />
            )}
          </>
        }
      />
      <InvitationFilters
        onFilter={(value) =>
          setOptions((previous) => ({ ...previous, ...value, offset: 0 }))
        }
      />
      {query.isPending || settings.isPending ? (
        <p role="status">Carregando convites…</p>
      ) : query.isError || settings.isError ? (
        <div className="rounded-xl border border-rule bg-surface p-6">
          <h2 className="font-semibold">Convites indisponíveis</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Confira sua conexão e se você continua administrando esta escola.
            Use Atualizar lista para tentar novamente.
          </p>
        </div>
      ) : query.data.invitations.length === 0 ? (
        <div className="rounded-xl border border-rule bg-surface px-6 py-10">
          <Mail className="mb-4 size-7 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">
            {options.search || options.status
              ? "Nenhum convite encontrado"
              : "Nenhum convite por aqui"}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {options.search || options.status
              ? "Tente outro nome ou e-mail, ou limpe os filtros para ver todos os convites."
              : "Convide o primeiro profissional e escolha os papéis que ele terá nesta escola."}
          </p>
          {options.offset > 0 && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setOptions((value) => ({ ...value, offset: 0 }))}
            >
              Voltar à primeira página
            </Button>
          )}
        </div>
      ) : (
        <InvitationTable
          invitations={query.data.invitations}
          total={query.data.total}
          options={options}
          setOptions={setOptions}
          fetching={query.isFetching}
          timeZone={settings.data.timeZone}
        />
      )}
      <p className="text-xs leading-5 text-muted-foreground">
        O vínculo é criado após o aceite. A tag Ativo indica um vínculo ativo
        com esta escola. Envio de e-mail e aceite são etapas diferentes.
      </p>
    </section>
  );
}
