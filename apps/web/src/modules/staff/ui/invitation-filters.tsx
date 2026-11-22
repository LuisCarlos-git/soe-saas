import { useAppForm } from "@soe/form";
import { Button } from "@soe/ui";
import { Search } from "lucide-react";
import {
  invitationListQuerySchema,
  type InvitationListQuery,
} from "@soe/contracts";

export function InvitationFilters({
  onFilter,
}: {
  onFilter: (value: Pick<InvitationListQuery, "search" | "status">) => void;
}) {
  const form = useAppForm({
    defaultValues: { search: "", status: "" },
    onSubmit: ({ value }) => {
      const parsed = invitationListQuerySchema.parse({
        search: value.search,
        ...(value.status && { status: value.status }),
      });
      onFilter({ search: parsed.search, status: parsed.status });
    },
  });
  return (
    <form.AppForm>
      <form
        className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_12rem_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.AppField name="search">
          {(field) => (
            <field.TextField
              label="Buscar profissional"
              type="search"
              placeholder="Nome ou e-mail"
              maxLength={160}
              reserveErrorSpace={false}
            />
          )}
        </form.AppField>
        <form.AppField name="status">
          {(field) => (
            <field.NativeSelectField
              label="Situação do convite"
              placeholder="Todas as situações"
              reserveErrorSpace={false}
              options={[
                { value: "PENDING", label: "Pendentes" },
                { value: "ACCEPTED", label: "Aceitos" },
                { value: "EXPIRED", label: "Expirados" },
                { value: "REVOKED", label: "Revogados" },
              ]}
            />
          )}
        </form.AppField>
        <div className="flex gap-2">
          <form.SubmitButton variant="outline">
            <Search className="size-4" aria-hidden="true" />
            Filtrar
          </form.SubmitButton>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              form.reset();
              onFilter({ search: "", status: undefined });
            }}
          >
            Limpar
          </Button>
        </div>
      </form>
    </form.AppForm>
  );
}
