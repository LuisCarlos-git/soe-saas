import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiClient } from "@soe/api-client";
import { Button, toast } from "@soe/ui";
import { buttonVariants } from "@soe/ui/primitives/button";
import { ArrowLeft } from "lucide-react";
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
    <section className="soe-route-content mx-auto w-full max-w-4xl space-y-6">
      <header className="flex items-start gap-3">
        <Link
          to="/schools"
          aria-label="Voltar às escolas"
          title="Voltar às escolas"
          className={buttonVariants({
            variant: "ghost",
            size: "icon",
            className: "size-11 text-muted-foreground hover:text-primary",
          })}
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight">
            Configurações da escola
          </h1>
          <p className="mt-2 break-words text-muted-foreground">
            {school.name}
          </p>
        </div>
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
          onReload={async () => {
            if (
              !window.confirm(
                "Recarregar e descartar alterações ainda não salvas?",
              )
            )
              return false;
            const result = await query.refetch();
            return result.isSuccess;
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
    </section>
  );
}
