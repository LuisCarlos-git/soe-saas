import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiClient } from "@soe/api-client";
import type { Invitation } from "@soe/contracts";
import { Button } from "@soe/ui";
import { buttonVariants } from "@soe/ui/primitives/button";
import { ArrowLeft, ChevronRight, Mail } from "lucide-react";
import { InvitationDialog } from "./invitation-dialog";
import { roleLabel } from "../model/roles";
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
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Profissionais</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
          Escolha a escola para convidar profissionais e acompanhar os convites
          da equipe.
        </p>
      </header>
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

const statusLabels: Record<Invitation["status"], string> = {
  PENDING: "Pendente de aceite",
  ACCEPTED: "Aceito",
  EXPIRED: "Expirado",
  REVOKED: "Revogado",
};
const deliveryLabels: Record<Invitation["deliveryStatus"], string> = {
  QUEUED: "E-mail na fila",
  SENT: "E-mail enviado",
  FAILED: "Falha no envio do e-mail",
};

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
  const [offset, setOffset] = useState(0);
  const settings = useQuery(staffSchoolQuery(api, actorId, school.id));
  const query = useQuery(
    staffInvitationsQuery(api, actorId, school.id, offset),
  );
  const date = (value: string) =>
    new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: settings.data?.timeZone ?? "UTC",
    }).format(new Date(value));
  return (
    <section className="soe-route-content space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
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
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight">
              Profissionais
            </h1>
            <p className="mt-2 break-words text-muted-foreground">
              {school.name}
            </p>
          </div>
        </div>
        {!query.isError && !settings.isError && (
          <InvitationDialog
            api={api}
            school={school}
            onSent={async () => {
              setOffset(0);
              await client.invalidateQueries({
                queryKey: staffInvitationsKey(actorId, school.id),
              });
            }}
          />
        )}
      </header>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Convites da equipe</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            O vínculo é criado após o aceite. Envio de e-mail e aceite são
            etapas diferentes.
          </p>
        </div>
        <Button
          variant="outline"
          loading={query.isFetching && !query.isPending}
          onClick={() => {
            void query.refetch();
            void settings.refetch();
          }}
        >
          Atualizar lista
        </Button>
      </div>
      {query.isPending || settings.isPending ? (
        <p role="status">Carregando convites…</p>
      ) : query.isError || settings.isError ? (
        <div className="rounded-xl border border-rule bg-surface p-6">
          <h3 className="font-semibold">Convites indisponíveis</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Confira sua conexão e se você continua administrando esta escola.
            Use Atualizar lista para tentar novamente.
          </p>
        </div>
      ) : query.data.invitations.length === 0 ? (
        <div className="rounded-xl border border-rule bg-surface px-6 py-10">
          <Mail className="mb-4 size-7 text-primary" aria-hidden="true" />
          <h3 className="text-lg font-semibold">Nenhum convite por aqui</h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Convide o primeiro profissional e escolha os papéis que ele terá
            nesta escola.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-rule rounded-xl border border-rule bg-surface">
          {query.data.invitations.map((invitation) => (
            <li
              key={invitation.id}
              className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <h3 className="break-words font-semibold">{invitation.name}</h3>
                <p className="break-all text-sm text-muted-foreground">
                  {invitation.email}
                </p>
                <p className="text-sm">
                  {invitation.roles.map(roleLabel).join(", ")}
                </p>
                <p className="text-xs leading-5 text-muted-foreground">
                  {invitation.acceptedAt
                    ? `Aceito em ${date(invitation.acceptedAt)}`
                    : `Válido até ${date(invitation.expiresAt)}`}{" "}
                  · horário da escola
                </p>
              </div>
              <div className="shrink-0 space-y-2 text-sm sm:text-right">
                <p
                  className={
                    invitation.status === "ACCEPTED"
                      ? "font-medium text-primary"
                      : "font-medium"
                  }
                >
                  {statusLabels[invitation.status]}
                </p>
                <p
                  className={
                    invitation.deliveryStatus === "FAILED"
                      ? "text-negative"
                      : "text-muted-foreground"
                  }
                >
                  {deliveryLabels[invitation.deliveryStatus]}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {query.data && !query.isError && (offset > 0 || query.data.hasMore) && (
        <nav
          aria-label="Páginas de convites"
          className="flex justify-end gap-3"
        >
          <Button
            variant="outline"
            disabled={offset === 0 || query.isFetching}
            onClick={() => setOffset((value) => Math.max(0, value - 20))}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            disabled={!query.data.hasMore || query.isFetching}
            onClick={() => setOffset((value) => value + 20)}
          >
            Próxima
          </Button>
        </nav>
      )}
    </section>
  );
}
