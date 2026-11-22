import { createFileRoute, notFound } from "@tanstack/react-router";
import { SchoolDirectory } from "../modules/schools";
export const Route = createFileRoute("/_authenticated/schools/professionals")({
  beforeLoad: ({ context }) => {
    if (!context.schoolAccess.schools.length) throw notFound();
  },
  head: () => ({ meta: [{ title: "Profissionais · SOE" }] }),
  component: function StaffSchoolsRoute() {
    return (
      <SchoolDirectory
        mode="professionals"
        api={Route.useRouteContext().api}
        actorId={Route.useRouteContext().identity.id}
      />
    );
  },
});
