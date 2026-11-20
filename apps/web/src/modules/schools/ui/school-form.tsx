import { useEffect } from "react";
import { useBlocker } from "@tanstack/react-router";
import { useAppForm, validateOnChangeAndBlur } from "@soe/form";
import { provisionSchoolSchema, type SchoolSettings } from "@soe/contracts";
import { Button } from "@soe/ui";

type Values = SchoolSettings & { initialAdministratorEmail: string };
function DirtyGuard({
  dirty,
  onDirtyChange,
}: {
  dirty: boolean;
  onDirtyChange?: ((dirty: boolean) => void) | undefined;
}) {
  useEffect(() => {
    onDirtyChange?.(dirty);
    return () => onDirtyChange?.(false);
  }, [dirty, onDirtyChange]);
  useBlocker({
    shouldBlockFn: () =>
      dirty && !window.confirm("Sair sem salvar as alterações?"),
    enableBeforeUnload: dirty,
  });
  return null;
}
export function SchoolForm({
  initial,
  creation = false,
  submit,
  onCancel,
  onDirtyChange,
}: {
  initial: Values;
  creation?: boolean;
  submit: (value: Values) => Promise<void>;
  onCancel?: (() => void) | undefined;
  onDirtyChange?: ((dirty: boolean) => void) | undefined;
}) {
  const form = useAppForm({
    defaultValues: initial,
    validationLogic: validateOnChangeAndBlur,
    validators: { onChange: provisionSchoolSchema },
    onSubmit: async ({ value }) => {
      try {
        await submit(provisionSchoolSchema.parse(value));
        form.reset(value);
      } catch {
        /* API errors use the global toast; keep the user's values. */
      }
    },
  });
  return (
    <form.AppForm>
      <form
        noValidate
        method="post"
        className="space-y-8"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.Subscribe selector={(state) => state.isDirty}>
          {(dirty) => (
            <DirtyGuard dirty={dirty} onDirtyChange={onDirtyChange} />
          )}
        </form.Subscribe>
        <fieldset className="space-y-4">
          <legend className="mb-4 text-base font-medium">
            Dados da escola
          </legend>
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Nome da escola"
                required
                autoComplete="off"
                maxLength={160}
              />
            )}
          </form.AppField>
          <div className="grid gap-4 sm:grid-cols-2">
            <form.AppField name="timeZone">
              {(field) => (
                <field.NativeSelectField
                  label="Fuso horário"
                  required
                  description="Usado para apresentar datas e prazos."
                  options={[
                    {
                      value: "America/Noronha",
                      label: "Fernando de Noronha (UTC−2)",
                    },
                    { value: "America/Sao_Paulo", label: "Brasília (UTC−3)" },
                    { value: "America/Manaus", label: "Manaus (UTC−4)" },
                    {
                      value: "America/Rio_Branco",
                      label: "Rio Branco (UTC−5)",
                    },
                    ...([
                      "America/Noronha",
                      "America/Sao_Paulo",
                      "America/Manaus",
                      "America/Rio_Branco",
                    ].includes(initial.timeZone)
                      ? []
                      : [{ value: initial.timeZone, label: initial.timeZone }]),
                  ]}
                />
              )}
            </form.AppField>
            <form.AppField name="academicYear">
              {(field) => (
                <field.NumberField
                  label="Ano letivo"
                  required
                  min={2000}
                  max={2100}
                  step={1}
                />
              )}
            </form.AppField>
          </div>
        </fieldset>
        <fieldset className="space-y-4">
          <legend className="mb-2 text-base font-medium">
            Como sua escola chama
          </legend>
          <p className="text-sm leading-relaxed text-muted-foreground">
            As nomenclaturas adaptam os nomes usados na escola e preservam as
            regras de acesso.
          </p>
          <form.AppField name="supportTeamLabel">
            {(field) => (
              <field.TextField
                label="Equipe de acompanhamento"
                required
                maxLength={80}
              />
            )}
          </form.AppField>
          <div className="grid gap-4 sm:grid-cols-2">
            <form.AppField name="studentLabel">
              {(field) => (
                <field.TextField label="Estudante" required maxLength={80} />
              )}
            </form.AppField>
            <form.AppField name="classLabel">
              {(field) => (
                <field.TextField label="Turma" required maxLength={80} />
              )}
            </form.AppField>
          </div>
        </fieldset>
        {creation && (
          <fieldset className="space-y-4">
            <legend className="mb-2 text-base font-medium">
              Responsável inicial
            </legend>
            <form.AppField name="initialAdministratorEmail">
              {(field) => (
                <field.TextField
                  label="E-mail do responsável"
                  type="email"
                  required
                  autoComplete="off"
                  description="Use uma identidade já cadastrada. Ela administrará esta escola, sem receber acesso automático a relatos restritos."
                />
              )}
            </form.AppField>
          </fieldset>
        )}
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-rule pt-6">
          {onCancel && (
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(pending) => (
                <Button variant="ghost" disabled={pending} onClick={onCancel}>
                  Cancelar
                </Button>
              )}
            </form.Subscribe>
          )}
          <form.SubmitButton>
            {creation ? "Criar escola piloto" : "Salvar configurações"}
          </form.SubmitButton>
        </div>
      </form>
    </form.AppForm>
  );
}
