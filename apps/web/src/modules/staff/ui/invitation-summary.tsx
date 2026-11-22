import type { StaffRole } from "@soe/contracts";
import { Badge } from "@soe/ui/primitives/badge";
import { ShieldCheck, UserRound } from "lucide-react";
import { roleLabel } from "../model/roles";

export type InvitationDraft = {
  name: string;
  email: string;
  roles: StaffRole[];
};

export function InvitationSummary({ draft }: { draft: InvitationDraft }) {
  return (
    <div className="space-y-4">
      <div className="grid min-w-0 grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-x-3 gap-y-2">
        <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserRound className="size-5" aria-hidden="true" />
        </span>
        <p className="min-w-0 font-semibold leading-6 [overflow-wrap:anywhere]">
          {draft.name}
        </p>
        <p className="col-span-2 min-w-0 text-sm leading-6 text-muted-foreground [overflow-wrap:anywhere]">
          {draft.email}
        </p>
      </div>
      <dl className="border-y border-rule py-4">
        <dt className="mb-2 text-sm text-muted-foreground">
          Papéis nesta escola
        </dt>
        <dd className="flex flex-wrap gap-2">
          {draft.roles.map((role) => (
            <Badge
              key={role}
              variant="secondary"
              className="whitespace-normal rounded-md bg-canvas px-2 py-1 text-ink"
            >
              {roleLabel(role)}
            </Badge>
          ))}
        </dd>
      </dl>
      <div className="flex gap-2 text-sm leading-6 text-muted-foreground">
        <ShieldCheck
          className="mt-1 size-5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <p>
          O acesso começa após o aceite. Administradores precisam de verificação
          em duas etapas. Relatos restritos exigem permissão.
        </p>
      </div>
    </div>
  );
}
