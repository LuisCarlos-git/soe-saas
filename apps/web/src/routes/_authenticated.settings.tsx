import { createFileRoute } from "@tanstack/react-router";
import { SettingsLayout } from "../modules/settings";
export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Configurações · SOE" }] }),
  component: SettingsLayout,
});
