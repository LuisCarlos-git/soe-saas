import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiClient } from "@soe/api-client";
import type { InvitationListQuery } from "@soe/contracts";
import { Button } from "@soe/ui";
import { Mail, RefreshCw } from "lucide-react";
import { InvitationDialog } from "./invitation-dialog";
import { InvitationFilters } from "./invitation-filters";
import { InvitationTable } from "./invitation-table";
import { PageToolbar } from "@soe/ui/components/page-toolbar";
import {
  staffInvitationsKey,
  staffInvitationsQuery,
  staffSchoolQuery,
} from "../data/queries";

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
      <PageToolbar
        description={school.name}

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
          schoolName={school.name}
          invitations={query.data.invitations}
          total={query.data.total}
          options={options}
          setOptions={setOptions}
          fetching={query.isFetching}
          timeZone={settings.data.timeZone}
        />
      )}
    </section>
  );
}
