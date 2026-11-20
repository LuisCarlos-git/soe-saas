import { useState } from "react";
import { Button } from "@soe/ui";
import {
  useStepFlow,
  type StepFlowNavigation,
} from "@soe/ui/hooks/use-step-flow";
import { StepFlowContent } from "@soe/ui/components/step-flow-content";

type Step = "choose" | "short" | "long" | "done";
function Choice() {
  return (
    <h3 data-step-focus tabIndex={-1}>
      Escolha o caminho
    </h3>
  );
}
function Summary({ navigation }: { navigation: StepFlowNavigation<Step> }) {
  return (
    <>
      <input type="hidden" value="synthetic" readOnly />
      <p>Resumo da etapa {navigation.currentStep}</p>
      <label>
        Revisão do resumo
        <input className="rounded-lg border border-control bg-surface p-2" />
      </label>
    </>
  );
}
function Details({ navigation }: { navigation: StepFlowNavigation<Step> }) {
  return (
    <>
      <Button onClick={() => navigation.back()}>Voltar à escolha</Button>
      <h3 data-step-focus tabIndex={-1}>
        Detalhes do caminho longo
      </h3>
    </>
  );
}
function Done() {
  return <p>Fluxo concluído</p>;
}
const flow = {
  choose: { next: ["short", "long"], component: Choice },
  short: { next: ["done"], component: Summary },
  long: { next: ["short"], component: Details },
  done: { component: Done },
} as const;
export function StepFlowPreview() {
  const [notice, setNotice] = useState("");
  const steps = useStepFlow<Step>({
    flow,
    initialStep: "choose",
    onInvalidTransition: (from, to) =>
      setNotice(`Transição negada: ${from} para ${to}`),
  });
  return (
    <section aria-label="Fluxo de etapas" className="space-y-3">
      <h2 className="text-xl font-semibold">Fluxo de etapas</h2>
      <StepFlowContent navigation={steps}>{steps.renderStep()}</StepFlowContent>
      <p aria-label="Histórico de etapas">{steps.history.join(" → ")}</p>
      <p aria-label="Estado do fluxo">
        {steps.isFinalStep ? "Etapa final" : "Há próximas etapas"};{" "}
        {steps.canGoBack ? "Pode voltar" : "Início do fluxo"}
      </p>
      <p role="status">{notice}</p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => steps.goTo("short")}>Caminho curto</Button>
        <Button onClick={() => steps.goTo("long")}>Caminho longo</Button>
        <Button
          onClick={() => {
            if (!steps.next()) setNotice("Escolha um caminho para avançar");
          }}
        >
          Avançar etapa
        </Button>
        <Button onClick={() => steps.goTo("done")}>Ir ao fim</Button>
        <Button onClick={() => steps.back()}>Voltar etapa</Button>
        <Button onClick={() => steps.reset()}>Reiniciar fluxo</Button>
        <Button onClick={() => steps.reset("short")}>
          Reiniciar no resumo
        </Button>
        <Button
          onClick={() => {
            steps.goTo("short");
            steps.next();
          }}
        >
          Sequência rápida
        </Button>
      </div>
    </section>
  );
}
