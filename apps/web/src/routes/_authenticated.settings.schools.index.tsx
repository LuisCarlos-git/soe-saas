import { createFileRoute } from "@tanstack/react-router";
import { SchoolsPage } from "../modules/schools";
export const Route = createFileRoute("/_authenticated/settings/schools/")({
  head: () => ({ meta: [{ title: "Escolas · Configurações · SOE" }] }),
  component: function SchoolsRoute() {
    const { api, identity, schoolAccess } = Route.useRouteContext();
    return (
      <SchoolsPage api={api} actorId={identity.id} access={schoolAccess} />
    );
  },
});
