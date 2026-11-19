import type { CSSProperties } from "react";
import { toast } from "sonner";
import { Toaster as Sonner } from "../primitives/sonner";

const semanticColors: CSSProperties & Record<`--${string}`, string> = {
  "--error-bg": "var(--color-negative-surface)",
  "--error-text": "var(--color-negative)",
  "--error-border": "var(--color-negative-surface)",
  "--success-bg": "var(--color-positive-surface)",
  "--success-text": "var(--color-positive)",
  "--success-border": "var(--color-positive-surface)",
  "--info-bg": "var(--color-info-surface)",
  "--info-text": "var(--color-info)",
  "--info-border": "var(--color-info-surface)",
  "--warning-bg": "var(--color-warning-surface)",
  "--warning-text": "var(--color-warning)",
  "--warning-border": "var(--color-warning-surface)",
};

export function Toaster() {
  return (
    <Sonner
      theme="light"
      richColors
      closeButton
      position="top-right"
      style={semanticColors}
      containerAriaLabel="Notificações"
      toastOptions={{
        duration: 7000,
        closeButtonAriaLabel: "Fechar notificação",
      }}
    />
  );
}
export { toast };
