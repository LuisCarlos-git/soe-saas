import { useState } from "react";
import type { ApiClient } from "@soe/api-client";
import { inviteProfessionalSchema, type StaffRole } from "@soe/contracts";
import { useAppForm, validateOnChangeAndBlur } from "@soe/form";
import { Button, toast } from "@soe/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@soe/ui/primitives/dialog";
import { useStepFlow } from "@soe/ui/hooks/use-step-flow";
import { StepFlowContent } from "@soe/ui/components/step-flow-content";
import { Check, Clock, Mail, Send, UserPlus, X } from "lucide-react";
import { staffRoleOptions } from "../model/roles";
import { InvitationSummary, type InvitationDraft } from "./invitation-summary";

const flow = {
  details: { next: ["review"] },
  review: { next: ["sent"] },
  sent: {},
} as const;

export function InvitationDialog({
  api,
  school,
  onSent,
}: {
  api: ApiClient;
  school: { id: string; name: string };
  onSent: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [instance, setInstance] = useState(0);
  function changeOpen(next: boolean) {
    if (next) setInstance((value) => value + 1);
    setOpen(next);
  }
  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="size-4" aria-hidden="true" />
          Convidar profissional
        </Button>
      </DialogTrigger>
      <InvitationContent
        key={instance}
        api={api}
        school={school}
        close={() => setOpen(false)}
        onSent={onSent}
      />
    </Dialog>
  );
}

function InvitationContent({
  api,
  school,
  close,
  onSent,
}: {
  api: ApiClient;
  school: { id: string; name: string };
  close: () => void;
  onSent: () => Promise<void>;
}) {
  const navigation = useStepFlow<"details" | "review" | "sent">({
    flow,
    initialStep: "details",
  });
  const [draft, setDraft] = useState<InvitationDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const roles: StaffRole[] = [];
  const form = useAppForm({
    defaultValues: { name: "", email: "", roles },
    validationLogic: validateOnChangeAndBlur,
    validators: { onChange: inviteProfessionalSchema },
    onSubmit: ({ value }) => {
      setDraft(inviteProfessionalSchema.parse(value));
      navigation.next();
    },
  });
  function requestClose(event: Event) {
    if (saving) {
      event.preventDefault();
      return;
    }
    if (
      navigation.currentStep !== "sent" &&
      form.state.isDirty &&
      !window.confirm("Descartar os dados deste convite?")
    )
      event.preventDefault();
  }
  async function send() {
    if (!draft || saving) return;
    setSaving(true);
    try {
      await api.inviteProfessional(school.id, draft);
      navigation.next();
      toast.success("Convite criado. Acompanhe o envio na lista.");
      await onSent();
    } catch {
      /* API errors use the global toast. */
    } finally {
      setSaving(false);
    }
  }
  return (
    <DialogContent
      showCloseButton={false}
      className="max-h-[calc(100svh-2rem)] overflow-y-auto border-rule bg-surface text-ink sm:max-w-xl"
      onEscapeKeyDown={requestClose}
      onInteractOutside={requestClose}
    >
      <DialogHeader
        className={
          navigation.currentStep === "sent" ? "sr-only" : "pr-10 text-left"
        }
      >
        <DialogTitle className="text-2xl">Convidar profissional</DialogTitle>
        <DialogDescription className="break-words">
          {school.name}
        </DialogDescription>
      </DialogHeader>
      <Button
        aria-label="Fechar convite"
        variant="ghost"
        className="absolute right-3 top-3 size-11 p-0"
        disabled={saving}
        onClick={() => {
          if (
            navigation.currentStep === "sent" ||
            !form.state.isDirty ||
            window.confirm("Descartar os dados deste convite?")
          )
            close();
        }}
      >
        <X className="size-5" aria-hidden="true" />
      </Button>
      <StepFlowContent navigation={navigation}>
        {navigation.currentStep === "details" ? (
          <form.AppForm>
            <form
              method="post"
              noValidate
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void form.handleSubmit();
              }}
            >
              <form.AppField name="name">
                {(field) => (
                  <field.TextField
                    label="Nome do profissional"
                    autoComplete="name"
                    required
                    maxLength={160}
                    reserveErrorSpace={false}
                  />
                )}
              </form.AppField>
              <form.AppField name="email">
                {(field) => (
                  <field.TextField
                    label="E-mail do profissional"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    reserveErrorSpace={false}
                  />
                )}
              </form.AppField>
              <form.AppField name="roles">
                {(field) => (
                  <field.CheckboxGroupField
                    label="Papéis nesta escola"
                    density="compact"
                    options={staffRoleOptions}
                    description="Selecione os papéis necessários. Administração e direção não liberam relatos restritos."
                  />
                )}
              </form.AppField>
              <form.SubmitButton className="w-full">
                Revisar convite
              </form.SubmitButton>
            </form>
          </form.AppForm>
        ) : navigation.currentStep === "review" && draft ? (
          <div className="space-y-5">
            <h3
              data-step-focus
              tabIndex={-1}
              className="text-lg font-semibold outline-none"
            >
              Confira antes de enviar
            </h3>
            <InvitationSummary draft={draft} />
            <div className="grid grid-cols-2 gap-3 border-t border-rule pt-4 sm:flex sm:justify-end">
              <Button
                variant="outline"
                className="min-w-0 px-3 text-sm sm:px-5 sm:text-base"
                disabled={saving}
                onClick={() => navigation.back()}
              >
                Voltar e editar
              </Button>
              <Button
                className="min-w-0 px-3 text-sm sm:px-5 sm:text-base"
                loading={saving}
                onClick={() => void send()}
              >
                <Send className="hidden size-4 sm:block" aria-hidden="true" />
                Enviar convite
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-positive-surface text-positive">
                <Check className="size-7" aria-hidden="true" />
              </span>
              <h3
                data-step-focus
                tabIndex={-1}
                className="text-2xl font-semibold tracking-tight outline-none"
              >
                Convite criado
              </h3>
              <p className="mt-2 break-words text-sm text-muted-foreground">
                Convite de acesso para {draft?.name}.
              </p>
              <p className="mt-1 break-all text-sm font-medium">
                {draft?.email}
              </p>
            </div>
            <div className="rounded-lg bg-canvas p-4">
              <p className="mb-3 text-sm font-semibold">O que acontece agora</p>
              <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                <li className="flex gap-3">
                  <Mail
                    className="mt-1 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>Acompanhe o envio do e-mail na lista de convites.</span>
                </li>
                <li className="flex gap-3">
                  <Clock
                    className="mt-1 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>
                    O acesso à escola começa quando a pessoa aceitar. E-mail
                    enviado ainda não significa aceite.
                  </span>
                </li>
              </ul>
            </div>
            <Button className="w-full" onClick={close}>
              Concluir
            </Button>
          </div>
        )}
      </StepFlowContent>
    </DialogContent>
  );
}
