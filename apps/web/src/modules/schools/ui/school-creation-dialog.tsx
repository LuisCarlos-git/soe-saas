import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { ApiClient } from "@soe/api-client";
import { Button, toast } from "@soe/ui";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@soe/ui/primitives/dialog";
import { SchoolForm } from "./school-form";
export function SchoolCreationDialog({
  api,
  actorId,
  onCreated,
}: {
  api: ApiClient;
  actorId: string;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const content = useRef<HTMLDivElement>(null);
  const client = useQueryClient();
  const changeOpen = (next: boolean) => {
    if (
      !next &&
      (saving ||
        (dirty && !window.confirm("Descartar o cadastro desta escola?")))
    )
      return;
    setOpen(next);
  };
  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" aria-hidden="true" />
          Nova escola
        </Button>
      </DialogTrigger>
      <DialogContent
        ref={content}
        onOpenAutoFocus={(event) => {
          const input = content.current?.querySelector("input");
          if (input) {
            event.preventDefault();
            input.focus();
          }
        }}
        showCloseButton={false}
        className="max-h-[calc(100svh-2rem)] overflow-y-auto border-rule bg-surface text-ink sm:max-w-2xl"
      >
        <DialogHeader className="pr-10 text-left">
          <DialogTitle className="text-2xl">Nova escola piloto</DialogTitle>
          <DialogDescription>
            Crie uma escola gratuita para validação com dados sintéticos. Todos
            os campos são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        <Button
          variant="ghost"
          aria-label="Fechar"
          className="absolute right-3 top-3 size-11 p-0"
          disabled={saving}
          onClick={() => changeOpen(false)}
        >
          <X className="size-5" aria-hidden="true" />
        </Button>
        {open && (
          <SchoolForm
            creation
            onDirtyChange={setDirty}
            onCancel={() => changeOpen(false)}
            initial={{
              name: "",
              timeZone: "America/Sao_Paulo",
              academicYear: new Date().getFullYear(),
              supportTeamLabel: "Orientação educacional",
              studentLabel: "Estudante",
              classLabel: "Turma",
              initialAdministratorEmail: "",
            }}
            submit={async (value) => {
              setSaving(true);
              try {
                await api.provisionSchool(value);
                setOpen(false);
                onCreated();
                await client.invalidateQueries({
                  queryKey: ["operator-schools", actorId],
                });
                await client.invalidateQueries({
                  queryKey: ["school-access", actorId],
                });
                toast.success("Escola piloto criada.");
              } finally {
                setSaving(false);
              }
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
