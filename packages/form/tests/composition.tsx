import { useState } from "react";
import { createRoot } from "react-dom/client";
import { useSelector } from "@tanstack/react-form";
import { z } from "zod";
import { Button } from "@soe/ui";
import {
  formOptions,
  useAppForm,
  validateOnChangeAndBlur,
  withForm,
} from "@soe/form";
import { useFormContext } from "@soe/form/context";
import "./composition.css";

const options = formOptions({
  defaultValues: { title: "", note: "" },
  validationLogic: validateOnChangeAndBlur,
  validators: {
    onChange: z.object({
      title: z.string().min(1, "Informe o título."),
      note: z.string().min(1, "Informe a observação."),
    }),
  },
});

const Fields = withForm({
  ...options,
  render: function Fields({ form }) {
    return (
      <>
        <form.AppField name="title">
          {(field) => <field.TextField label="Título" required />}
        </form.AppField>
        <form.AppField name="note">
          {(field) => <field.TextField label="Observação" required />}
        </form.AppField>
      </>
    );
  },
});

function SubmissionState() {
  const form = useFormContext();
  const isSubmitting = useSelector(form.store, (state) => state.isSubmitting);
  return (
    <output aria-label="Estado do envio">
      {isSubmitting ? "Enviando" : "Pronto"}
    </output>
  );
}

function Composition() {
  const [started, setStarted] = useState(0);
  const [submitted, setSubmitted] = useState("");
  const [pending, setPending] = useState<{ complete: () => void } | null>(null);
  const form = useAppForm({
    ...options,
    onSubmit: async ({ value }) => {
      setStarted((count) => count + 1);
      await new Promise<void>((complete) => setPending({ complete }));
      setSubmitted(JSON.stringify(value));
      setPending(null);
    },
  });
  return (
    <main className="mx-auto grid max-w-xl gap-6 p-6">
      <h1 className="text-2xl font-semibold">Composição de formulário</h1>
      <form.AppForm>
        <form
          aria-label="Exemplo conectado"
          noValidate
          method="post"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <Fields form={form} />
          <form.SubmitButton>Salvar exemplo</form.SubmitButton>
        </form>
        <SubmissionState />
      </form.AppForm>
      <output aria-label="Envios iniciados">{started}</output>
      <output aria-label="Valores enviados" className="break-all">
        {submitted}
      </output>
      <Button
        type="button"
        variant="outline"
        disabled={!pending}
        onClick={() => pending?.complete()}
      >
        Concluir envio
      </Button>
    </main>
  );
}

const element = document.getElementById("root");
if (element) {
  const root = createRoot(element);
  root.render(<Composition />);
  import.meta.hot?.dispose(() => root.unmount());
}
