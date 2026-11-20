import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiClient } from "@soe/api-client";
import { Button, toast } from "@soe/ui";
import { schoolSettingsSchema } from "@soe/contracts";
import { schoolSettingsQuery } from "../data/queries";
import { SchoolForm } from "./school-form";
import { SchoolBoundary } from "./school-boundary";
export function SchoolSettingsPage({
  api,
  actorId,
  organizationId,
  allowed,
}: {
  api: ApiClient;
  actorId: string;
  organizationId: string;
  allowed: boolean;
}) {
  return (
    <SchoolBoundary api={api} actorId={actorId} allowed={allowed}>
      <Settings api={api} actorId={actorId} organizationId={organizationId} />
    </SchoolBoundary>
  );
}
function Settings({
  api,
  actorId,
  organizationId,
}: {
  api: ApiClient;
  actorId: string;
  organizationId: string;
}) {
  const client = useQueryClient();
  const options = schoolSettingsQuery(api, actorId, organizationId);
  const query = useQuery(options);
  if (query.isPending)
    return <p role="status">Carregando configurações da escola…</p>;
  if (query.isError)
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Configurações indisponíveis</h2>
        <p>Confira sua conexão e se o vínculo com a escola continua ativo.</p>
        <Button
          onClick={() => {
            void query.refetch();
          }}
        >
          Tentar novamente
        </Button>
      </section>
    );
  const school = query.data;
  return (
    <section className="soe-route-content max-w-2xl space-y-6">
      <Link
        to="/schools"
        className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4"
      >
        Voltar às escolas
      </Link>
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Configurações da escola
        </h1>
        <p className="mt-2 break-words text-muted-foreground">{school.name}</p>
      </header>
      <p className="rounded-lg bg-primary/5 p-4 text-sm leading-relaxed">
        Validação com dados sintéticos. A liberação para dados reais depende das
        aprovações e verificações do piloto.
      </p>
      <div className="rounded-xl border border-rule bg-surface p-5 sm:p-6">
        <SchoolForm
          key={`${school.id}:${school.version}`}
          initial={{
            name: school.name,
            timeZone: school.timeZone,
            academicYear: school.academicYear,
            supportTeamLabel: school.supportTeamLabel,
            studentLabel: school.studentLabel,
            classLabel: school.classLabel,
            initialAdministratorEmail: school.initialAdministrator.email,
            initialAdministratorName: school.initialAdministrator.name,
          }}
          submit={async (value) => {
            const settings = schoolSettingsSchema.strip().parse(value);
            const saved = await api.updateSchool(organizationId, {
              ...settings,
              version: school.version,
            });
            client.setQueryData(options.queryKey, saved);
            await client.invalidateQueries({
              queryKey: ["school-access", actorId],
            });
            toast.success("Configurações da escola salvas.");
          }}
        />
      </div>
      <Button
        variant="outline"
        onClick={() => {
          if (
            window.confirm(
              "Recarregar e descartar alterações ainda não salvas?",
            )
          )
            void query.refetch();
        }}
      >
        Recarregar configurações
      </Button>
    </section>
  );
}
