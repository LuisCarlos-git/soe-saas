import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ApiClient } from "@soe/api-client";
import type { ManagedSchoolsQuery } from "@soe/contracts";
import { useAppForm } from "@soe/form";
import { Button } from "@soe/ui";
import { PageToolbar } from "@soe/ui/components/page-toolbar";
import { RefreshCw, Search, School } from "lucide-react";
import { managedSchoolsQuery } from "../data/queries";
import { SchoolBoundary } from "./school-boundary";
import { SchoolDirectoryTable } from "./school-directory-table";

export function SchoolDirectory(props: { api: ApiClient; actorId: string }) {
  return (
    <SchoolBoundary api={props.api} actorId={props.actorId} allowed>
      <Directory {...props} />
    </SchoolBoundary>
  );
}
function Directory({ api, actorId }: { api: ApiClient; actorId: string }) {
  const [options, setOptions] = useState<ManagedSchoolsQuery>({
    offset: 0,
    limit: 10,
    search: "",
    sortBy: "name",
    sortDirection: "asc",
  });
  const query = useQuery(managedSchoolsQuery(api, actorId, options));
  const form = useAppForm({
    defaultValues: { search: "" },
    onSubmit: ({ value }) =>
      setOptions((previous) => ({
        ...previous,
        offset: 0,
        search: value.search.trim(),
      })),
  });
  return (
    <section className="soe-route-content space-y-6">
      <PageToolbar
        description="Gerencie suas escolas, acompanhe a equipe e organize convites."
        actions={
          <Button
            variant="outline"
            size="icon"
            className="size-11 p-0"
            aria-label="Atualizar escolas"
            title="Atualizar escolas"
            loading={query.isFetching && !query.isPending}
            onClick={() => void query.refetch()}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
          </Button>
        }
      />
      <form.AppForm>
        <form
          method="post"
          className="flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <div className="min-w-0 basis-64 flex-1">
            <form.AppField name="search">
              {(field) => (
                <field.TextField
                  type="search"
                  label="Buscar escola"
                  placeholder="Nome da escola"
                  maxLength={160}
                  reserveErrorSpace={false}
                />
              )}
            </form.AppField>
          </div>
          <div className="flex gap-2">
            <form.SubmitButton variant="outline">
              <Search className="size-4" aria-hidden="true" />
              Buscar
            </form.SubmitButton>
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                form.reset();
                setOptions((value) => ({ ...value, search: "", offset: 0 }));
              }}
            >
              Limpar
            </Button>
          </div>
        </form>
      </form.AppForm>
      {query.isPending ? (
        <p role="status">Carregando escolas…</p>
      ) : query.isError ? (
        <div className="rounded-xl border border-rule bg-surface p-6">
          <h2 className="font-semibold">Escolas indisponíveis</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Confira a conexão e use Atualizar escolas para tentar novamente.
          </p>
        </div>
      ) : query.data.schools.length === 0 ? (
        <div className="rounded-xl border border-rule bg-surface p-6">
          <School className="mb-3 size-6 text-primary" aria-hidden="true" />
          <h2 className="font-semibold">
            {options.search
              ? "Nenhuma escola encontrada"
              : "Nenhuma escola disponível"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {options.search
              ? "Tente outro nome ou limpe a busca."
              : "Somente escolas que você administra aparecem aqui."}
          </p>
          {options.offset > 0 && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setOptions((value) => ({ ...value, offset: 0 }))}
            >
              Voltar à primeira página
            </Button>
          )}
        </div>
      ) : (
        <SchoolDirectoryTable
          schools={query.data.schools}
          total={query.data.total}
          options={options}
          setOptions={setOptions}
          fetching={query.isFetching}
        />
      )}
    </section>
  );
}
