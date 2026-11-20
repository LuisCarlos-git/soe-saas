import { createFileRoute } from "@tanstack/react-router";
import { MfaSettings } from "../modules/identity";
export const Route = createFileRoute("/_authenticated/settings/security")({
  head: () => ({ meta: [{ title: "Segurança · Configurações · SOE" }] }),
  component: () => <MfaSettings api={Route.useRouteContext().api} />,
});
