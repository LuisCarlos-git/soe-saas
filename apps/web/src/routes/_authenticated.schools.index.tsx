import { createFileRoute, notFound } from "@tanstack/react-router";
import { SchoolsPage } from "../modules/schools";
export const Route = createFileRoute("/_authenticated/schools/")({
  beforeLoad: ({ context }) => {
    if (!context.schoolAccess.schools.length) throw notFound();
  },
  head: () => ({ meta: [{ title: "Minhas escolas · SOE" }] }),
  component: function SchoolsRoute() {
    const { api, identity, schoolAccess } = Route.useRouteContext();
    return (
      <SchoolsPage api={api} actorId={identity.id} access={schoolAccess} />
    );
  },
});
