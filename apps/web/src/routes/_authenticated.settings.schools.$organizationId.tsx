import { createFileRoute } from "@tanstack/react-router";
import { SchoolSettingsPage } from "../modules/schools";
export const Route = createFileRoute(
  "/_authenticated/settings/schools/$organizationId",
)({
  head: () => ({ meta: [{ title: "Escola · Configurações · SOE" }] }),
  component: function SchoolRoute() {
    const { api, identity, schoolAccess } = Route.useRouteContext();
    const { organizationId } = Route.useParams();
    return (
      <SchoolSettingsPage
        api={api}
        actorId={identity.id}
        organizationId={organizationId}
        allowed={schoolAccess.schools.some(
          (school) => school.id === organizationId,
        )}
      />
    );
  },
});
