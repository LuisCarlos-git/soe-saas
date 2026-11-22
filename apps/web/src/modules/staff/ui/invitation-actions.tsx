import { useRef, useState } from "react";
import type { ListedInvitation } from "@soe/contracts";
import { Button } from "@soe/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@soe/ui/primitives/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@soe/ui/primitives/dropdown-menu";
import { Eye, MoreHorizontal, X } from "lucide-react";
import { InvitationSummary } from "./invitation-summary";

const statusLabels = {
  PENDING: "Pendente de aceite",
  ACCEPTED: "Aceito",
  EXPIRED: "Expirado",
  REVOKED: "Revogado",
};
const deliveryLabels = {
  QUEUED: "Na fila",
  SENT: "E-mail enviado",
  FAILED: "Falha no envio",
};

export function InvitationActions({
  invitation,
  schoolName,
  timeZone,
}: {
  invitation: ListedInvitation;
  schoolName: string;
  timeZone: string;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const date = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
          timeZone,
        }).format(new Date(value))
      : "—";
  const information = [
    ["Situação do convite", statusLabels[invitation.status]],
    ["Envio do e-mail", deliveryLabels[invitation.deliveryStatus]],
    ["Convidado em", date(invitation.createdAt)],
    ["Válido até", date(invitation.expiresAt)],
    ["E-mail enviado em", date(invitation.sentAt)],
    ["Aceito em", date(invitation.acceptedAt)],
    ...(invitation.status === "ACCEPTED"
      ? [
          [
            "Vínculo na escola",
            invitation.membershipActive ? "Ativo" : "Inativo",
          ],
        ]
      : []),
  ];
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            ref={trigger}
            variant="ghost"
            size="icon"
            className="size-11 p-0"
            aria-label={`Ações do convite de ${invitation.name}`}
            title="Ações do convite"
          >
            <MoreHorizontal className="size-5" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onCloseAutoFocus={(event) => {
            if (open) event.preventDefault();
          }}
        >
          <DropdownMenuItem
            className="min-h-11 gap-2 px-3"
            onSelect={() => setOpen(true)}
          >
            <Eye className="size-4" aria-hidden="true" />
            Ver detalhes
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100svh-2rem)] overflow-y-auto border-rule bg-surface text-ink sm:max-w-xl"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          trigger.current?.focus();
        }}
      >
        <DialogHeader className="pr-8 text-left">
          <DialogTitle className="text-2xl">Detalhes do convite</DialogTitle>
          <DialogDescription className="break-words">
            {schoolName}
          </DialogDescription>
        </DialogHeader>
        <Button
          variant="ghost"
          className="absolute right-3 top-3 z-10 size-11 p-0"
          aria-label="Fechar detalhes do convite"
          onClick={() => setOpen(false)}
        >
          <X className="size-5" aria-hidden="true" />
        </Button>
        <InvitationSummary draft={invitation} />
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
          {information.map(([label, value]) => (
            <div key={label}>
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="mt-1 font-medium tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-muted-foreground">
          Datas no horário da escola. Envio de e-mail e aceite são etapas
          diferentes.
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setOpen(false)}
        >
          Fechar detalhes
        </Button>
      </DialogContent>
    </Dialog>
  );
}
