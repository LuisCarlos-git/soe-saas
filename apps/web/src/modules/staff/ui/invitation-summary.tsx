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
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserRound className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="break-words font-semibold">{draft.name}</p>
          <p className="break-all text-sm text-muted-foreground">
            {draft.email}
          </p>
        </div>
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
      <div className="flex gap-3 text-sm leading-6 text-muted-foreground">
        <ShieldCheck
          className="mt-1 size-5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <p>
          O acesso começa após o aceite. Administração exige proteção em duas
          etapas e não libera relatos restritos.
        </p>
      </div>
    </div>
  );
}
