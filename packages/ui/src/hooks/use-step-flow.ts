import {
  createElement,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactElement,
} from "react";

export interface StepFlowNavigation<TStep extends string> {
  currentStep: TStep;
  nextSteps: readonly TStep[];
  canGoBack: boolean;
  isFinalStep: boolean;
  direction: "forward" | "back" | "reset";
  transitionId: number;
  goTo: (target: TStep) => boolean;
  next: () => boolean;
  back: () => boolean;
  reset: (target?: TStep) => boolean;
}
export interface StepFlowStep<TStep extends string> {
  readonly next?: readonly TStep[];
  readonly component?: ComponentType<{ navigation: StepFlowNavigation<TStep> }>;
}
export interface UseStepFlowParams<TStep extends string> {
  flow: Readonly<Record<TStep, StepFlowStep<TStep>>>;
  initialStep: TStep;
  onInvalidTransition?: (from: TStep, to: TStep) => void;
}
export interface UseStepFlowReturnType<
  TStep extends string,
> extends StepFlowNavigation<TStep> {
  history: readonly TStep[];
  step: StepFlowStep<TStep>;
  StepComponent: StepFlowStep<TStep>["component"];
  renderStep: () => ReactElement | null;
}
interface FlowState<TStep extends string> {
  history: readonly TStep[];
  direction: StepFlowNavigation<TStep>["direction"];
  transitionId: number;
}

export function useStepFlow<TStep extends string>({
  flow,
  initialStep,
  onInvalidTransition,
}: UseStepFlowParams<TStep>): UseStepFlowReturnType<TStep> {
  if (!Object.hasOwn(flow, initialStep))
    throw new Error("Step flow requires a declared initial step.");
  const [state, setState] = useState<FlowState<TStep>>({
    history: [initialStep],
    direction: "reset",
    transitionId: 0,
  });
  // Commands can be batched or retained by async work. Resolve each against the
  // latest accepted navigation, rather than a render's captured current step.
  const latest = useRef(state);
  const commit = useCallback(
    (history: readonly TStep[], direction: FlowState<TStep>["direction"]) => {
      const updated = {
        history,
        direction,
        transitionId: latest.current.transitionId + 1,
      };
      latest.current = updated;
      setState(updated);
    },
    [],
  );
  const goTo = useCallback(
    (target: TStep) => {
      const previous = latest.current;
      const from = previous.history[previous.history.length - 1] ?? initialStep;
      if (
        !Object.hasOwn(flow, target) ||
        !(flow[from]?.next ?? []).includes(target)
      ) {
        onInvalidTransition?.(from, target);
        return false;
      }
      commit([...previous.history, target], "forward");
      return true;
    },
    [flow, initialStep, onInvalidTransition, commit],
  );
  const next = useCallback(() => {
    const history = latest.current.history;
    const from = history[history.length - 1] ?? initialStep;
    const allowed = flow[from]?.next ?? [];
    const target = allowed.length === 1 ? allowed[0] : undefined;
    return target !== undefined ? goTo(target) : false;
  }, [flow, initialStep, goTo]);
  const back = useCallback(() => {
    const history = latest.current.history;
    if (history.length <= 1) return false;
    commit(history.slice(0, -1), "back");
    return true;
  }, [commit]);
  const reset = useCallback(
    (target: TStep = initialStep) => {
      if (!Object.hasOwn(flow, target)) {
        const history = latest.current.history;
        onInvalidTransition?.(
          history[history.length - 1] ?? initialStep,
          target,
        );
        return false;
      }
      commit([target], "reset");
      return true;
    },
    [flow, initialStep, onInvalidTransition, commit],
  );
  const currentStep = state.history[state.history.length - 1] ?? initialStep;
  const step = flow[currentStep];
  if (!step)
    throw new Error(
      "The active step must remain declared while a flow is mounted.",
    );
  const navigation = useMemo<StepFlowNavigation<TStep>>(
    () => ({
      currentStep,
      nextSteps: step.next ?? [],
      canGoBack: state.history.length > 1,
      isFinalStep: !step.next?.length,
      direction: state.direction,
      transitionId: state.transitionId,
      goTo,
      next,
      back,
      reset,
    }),
    [currentStep, step, state, goTo, next, back, reset],
  );
  const StepComponent = step.component;
  const renderStep = useCallback(
    () => (StepComponent ? createElement(StepComponent, { navigation }) : null),
    [StepComponent, navigation],
  );
  return {
    ...navigation,
    history: state.history,
    step,
    StepComponent,
    renderStep,
  };
}
