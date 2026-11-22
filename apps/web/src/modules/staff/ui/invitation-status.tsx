import { useState } from "react";
import type { ListedInvitation } from "@soe/contracts";
import { Button, cn } from "@soe/ui";
import { Badge } from "@soe/ui/primitives/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@soe/ui/primitives/tooltip";
import { Check, Clock } from "lucide-react";

export function InvitationStatus({
  invitation,
}: {
  invitation: ListedInvitation;
}) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  function close() {
    setPinned(false);
    setOpen(false);
  }
  const active =
    invitation.status === "ACCEPTED" && invitation.membershipActive;
  const pending = invitation.status === "PENDING";
  const label =
    invitation.status === "ACCEPTED"
      ? active
        ? "Ativo"
        : "Inativo"
      : pending
        ? "Pendente"
        : invitation.status === "EXPIRED"
          ? "Expirado"
          : "Revogado";
  const support =
    invitation.status === "ACCEPTED"
      ? active
        ? "Convite aceito e vínculo ativo nesta escola."
        : "Convite aceito, mas o vínculo está inativo."
      : pending
        ? "Aguardando o aceite para criar o vínculo com a escola."
        : invitation.status === "EXPIRED"
          ? "O prazo para aceitar este convite terminou."
          : "Este convite foi revogado.";
  const delivery = {
    QUEUED: "E-mail na fila.",
    SENT: "E-mail enviado.",
    FAILED: "Falha no envio do e-mail.",
  }[invitation.deliveryStatus];
  return (
    <Tooltip
      open={open}
      onOpenChange={(next) => {
        if (next || !pinned) setOpen(next);
      }}
    >
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          className="min-h-11 p-0 hover:bg-transparent"
          onClick={(event) => {
            event.preventDefault();
            setPinned(!pinned);
            setOpen(!pinned);
          }}
          onBlur={close}
        >
          <Badge
            variant="outline"
            className={cn(
              "gap-1.5 border-transparent px-2.5 py-1",
              active
                ? "bg-positive/10 text-positive"
                : pending
                  ? "bg-warning/10 text-warning"
                  : "bg-canvas text-muted-foreground",
            )}
          >
            {active ? (
              <Check aria-hidden="true" />
            ) : pending ? (
              <Clock aria-hidden="true" />
            ) : null}
            {label}
          </Badge>
        </Button>
      </TooltipTrigger>
      <TooltipContent
        onEscapeKeyDown={close}
        onPointerDownOutside={close}
        side="top"
        sideOffset={4}
        className="max-w-64 text-sm leading-5"
      >
        <p>{support}</p>
        <p className="mt-1">{delivery} Envio não significa aceite.</p>
      </TooltipContent>
    </Tooltip>
  );
}
