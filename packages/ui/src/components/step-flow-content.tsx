import { useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "#lib/utils";
import type { StepFlowNavigation } from "#hooks/use-step-flow";

export function StepFlowContent<TStep extends string>({
  navigation,
  children,
  className,
}: {
  navigation: Pick<
    StepFlowNavigation<TStep>,
    "currentStep" | "direction" | "transitionId"
  >;
  children: ReactNode;
  className?: string;
}) {
  const content = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (navigation.transitionId === 0) return;
    const root = content.current;
    const preferred = root?.querySelector<HTMLElement>("[data-step-focus]");
    const controls = root?.querySelectorAll<HTMLElement>(
      "input:enabled:not([type=hidden]), select:enabled, textarea:enabled, button:enabled",
    );
    const target = [preferred, ...(controls ?? [])].find(
      (element) => element && element.getClientRects().length > 0,
    );
    (target ?? content.current)?.focus();
  }, [navigation.transitionId]);
  // A keyed subtree removes previous fields immediately. Never keep an outgoing
  // step (which may contain a password or enrollment key) mounted for animation.
  return (
    <div
      key={navigation.transitionId}
      ref={content}
      tabIndex={-1}
      className={cn("soe-step-flow-content outline-none", className)}
      data-slot="step-flow-content"
      data-step={navigation.currentStep}
      data-direction={navigation.direction}
    >
      {children}
    </div>
  );
}
