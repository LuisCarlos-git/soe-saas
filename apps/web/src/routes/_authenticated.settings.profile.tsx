import { createFileRoute } from "@tanstack/react-router";
import { ProfileSettings } from "../modules/identity";
export const Route = createFileRoute("/_authenticated/settings/profile")({
  head: () => ({ meta: [{ title: "Perfil · Configurações · SOE" }] }),
  component: () => (
    <ProfileSettings identity={Route.useRouteContext().identity} />
  ),
});
