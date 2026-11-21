import { createFileRoute, notFound } from "@tanstack/react-router";
import { StaffPage } from "../modules/staff";
import { SchoolBoundary } from "../modules/schools";
export const Route = createFileRoute(
  "/_authenticated/schools/$organizationId/professionals",
)({
  beforeLoad: ({ context, params }) => {
    if (
      !context.schoolAccess.schools.some(
        (school) => school.id === params.organizationId,
      )
    )
      throw notFound();
  },
  head: () => ({ meta: [{ title: "Profissionais da escola · SOE" }] }),
  component: function StaffRoute() {
    const { api, identity, schoolAccess } = Route.useRouteContext();
    const { organizationId } = Route.useParams();
    const school = schoolAccess.schools.find(
      (item) => item.id === organizationId,
    )!;
    return (
      <SchoolBoundary api={api} actorId={identity.id} allowed>
        <StaffPage
          key={organizationId}
          api={api}
          actorId={identity.id}
          school={school}
        />
      </SchoolBoundary>
    );
  },
});
