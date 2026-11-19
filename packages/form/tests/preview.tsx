import { useState } from "react";
import { createRoot } from "react-dom/client";
import { z } from "zod";
import { Button } from "@soe/ui";
import { useAppForm, validateOnChangeAndBlur } from "@soe/form";
import "./preview.css";

const schema = z.object({
  title: z.string().min(1, "Informe o título."),
  note: z.string().min(1, "Informe a observação."),
  confirmed: z.boolean().refine(Boolean, "Confirme a leitura."),
  notifications: z.boolean(),
  category: z.string().min(1, "Escolha a categoria."),
  unit: z.string().min(1, "Escolha a unidade."),
  period: z.string().min(1, "Escolha o período."),
  amount: z
    .number()
    .nonnegative("Informe uma quantidade positiva ou zero.")
    .nullable()
    .refine((value) => value !== null, "Informe a quantidade."),
});
const defaultValues: z.input<typeof schema> = {
  title: "",
  note: "",
  confirmed: false,
  notifications: false,
  category: "",
  unit: "",
  period: "",
  amount: 0,
};

function ExampleForm({ disabled = false }: { disabled?: boolean }) {
  const [submitted, setSubmitted] = useState("");
  const form = useAppForm({
    defaultValues,
    validationLogic: validateOnChangeAndBlur,
    validators: { onChange: schema },
    onSubmit: ({ value }) => setSubmitted(JSON.stringify(value)),
  });
  let title = "Formulário editável";
  if (disabled) title = "Formulário desabilitado";
  return (
    <section className="rounded-xl border border-rule bg-surface p-6">
      <h2 className="mb-6 text-xl font-semibold">{title}</h2>
      <form.AppForm>
        <form
          aria-label={title}
          noValidate
          className="space-y-1"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.AppField name="title">
            {(field) => (
              <field.TextField label="Título" required disabled={disabled} />
            )}
          </form.AppField>
          <form.AppField name="note">
            {(field) => (
              <field.TextareaField
                label="Observação"
                description="Use apenas informações fictícias."
                required
                disabled={disabled}
              />
            )}
          </form.AppField>
          <form.AppField name="confirmed">
            {(field) => (
              <field.CheckboxField
                label="Confirmo a leitura"
                required
                disabled={disabled}
              />
            )}
          </form.AppField>
          <form.AppField name="notifications">
            {(field) => (
              <field.SwitchField label="Receber avisos" disabled={disabled} />
            )}
          </form.AppField>
          <form.AppField name="category">
            {(field) => (
              <field.SelectField
                label="Categoria"
                required
                disabled={disabled}
                options={[
                  { value: "a", label: "Categoria A" },
                  { value: "b", label: "Categoria B" },
                  { value: "blocked", label: "Indisponível", disabled: true },
                ]}
              />
            )}
          </form.AppField>
          <form.AppField name="unit">
            {(field) => (
              <field.NativeSelectField
                label="Unidade"
                required
                disabled={disabled}
                options={[
                  { value: "central", label: "Unidade central" },
                  { value: "extra", label: "Unidade extra" },
                ]}
              />
            )}
          </form.AppField>
          <form.AppField name="period">
            {(field) => (
              <field.RadioGroupField
                label="Período"
                required
                disabled={disabled}
                options={[
                  { value: "morning", label: "Manhã" },
                  { value: "afternoon", label: "Tarde" },
                ]}
              />
            )}
          </form.AppField>
          <form.AppField name="amount">
            {(field) => (
              <field.NumberField
                label="Quantidade"
                required
                disabled={disabled}
              />
            )}
          </form.AppField>
          <div className="flex flex-wrap gap-3 pt-3">
            <form.SubmitButton disabled={disabled}>
              Salvar exemplo
            </form.SubmitButton>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => {
                form.reset();
                setSubmitted("");
              }}
            >
              Restaurar
            </Button>
          </div>
          <output
            aria-label="Valores enviados"
            className="mt-4 block break-all text-sm"
          >
            {submitted}
          </output>
        </form>
      </form.AppForm>
    </section>
  );
}

function Preview() {
  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-6">
      <h1 className="mb-6 text-2xl font-semibold">
        Formulários de demonstração
      </h1>
      <div className="grid gap-6 md:grid-cols-2">
        <ExampleForm />
        <ExampleForm disabled />
      </div>
    </main>
  );
}
const element = document.getElementById("root");
if (element) {
  const root = createRoot(element);
  root.render(<Preview />);
  import.meta.hot?.dispose(() => root.unmount());
}
