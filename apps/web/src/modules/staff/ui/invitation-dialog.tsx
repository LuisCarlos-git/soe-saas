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
import { Check, UserPlus, X } from "lucide-react";
import { staffRoleOptions, roleLabel } from "../model/roles";

type Draft = { name: string; email: string; roles: StaffRole[] };
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
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="size-4" aria-hidden="true" />
          Convidar profissional
        </Button>
      </DialogTrigger>
      {open && (
        <InvitationContent
          api={api}
          school={school}
          close={() => setOpen(false)}
          onSent={onSent}
        />
      )}
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
  const [draft, setDraft] = useState<Draft | null>(null);
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
      <DialogHeader className="pr-10 text-left">
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
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Profissional</dt>
                <dd className="mt-1 break-words font-medium">{draft.name}</dd>
                <dd className="break-all text-muted-foreground">
                  {draft.email}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Papéis nesta escola</dt>
                <dd className="mt-1">
                  {draft.roles.map(roleLabel).join(", ")}
                </dd>
              </div>
            </dl>
            <p className="text-sm leading-relaxed text-muted-foreground">
              O vínculo será criado somente quando a pessoa aceitar o convite.
              Acesso administrativo exige proteção em duas etapas.
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                disabled={saving}
                onClick={() => navigation.back()}
              >
                Voltar e editar
              </Button>
              <Button loading={saving} onClick={() => void send()}>
                Enviar convite
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Check className="size-8 text-primary" aria-hidden="true" />
            <h3
              data-step-focus
              tabIndex={-1}
              className="text-xl font-semibold outline-none"
            >
              Convite criado
            </h3>
            <p className="break-words text-muted-foreground">
              O envio para {draft?.email} será acompanhado na lista de convites.
            </p>
            <p className="text-sm text-muted-foreground">
              E-mail enviado não significa convite aceito.
            </p>
            <Button className="w-full" onClick={close}>
              Concluir
            </Button>
          </div>
        )}
      </StepFlowContent>
    </DialogContent>
  );
}
