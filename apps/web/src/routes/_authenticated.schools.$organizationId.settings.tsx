import { createFileRoute, notFound } from "@tanstack/react-router";
import { SchoolSettingsPage } from "../modules/schools";
export const Route = createFileRoute(
  "/_authenticated/schools/$organizationId/settings",
)({
  beforeLoad: ({ context, params }) => {
    if (
      !context.schoolAccess.schools.some(
        (school) => school.id === params.organizationId,
      )
    )
      throw notFound();
  },
  head: () => ({ meta: [{ title: "Configurações da escola · SOE" }] }),
  component: function SchoolRoute() {
    const { api, identity } = Route.useRouteContext();
    const { organizationId } = Route.useParams();
    return (
      <SchoolSettingsPage
        api={api}
        actorId={identity.id}
        organizationId={organizationId}
        allowed
      />
    );
  },
});
