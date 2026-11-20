import { createFileRoute, notFound } from "@tanstack/react-router";
import { PilotSchoolsPage } from "../modules/schools";
export const Route = createFileRoute("/_authenticated/administration/schools")({
  beforeLoad: ({ context }) => {
    if (!context.schoolAccess.canProvisionSchools) throw notFound();
  },
  head: () => ({ meta: [{ title: "Escolas piloto · Administração · SOE" }] }),
  component: function PilotSchoolsRoute() {
    const { api, identity, schoolAccess } = Route.useRouteContext();
    return (
      <PilotSchoolsPage
        api={api}
        actorId={identity.id}
        allowed={schoolAccess.canProvisionSchools}
      />
    );
  },
});
