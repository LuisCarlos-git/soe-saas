import { createFileRoute, notFound } from "@tanstack/react-router";
import { StaffSchoolsPage } from "../modules/staff";
export const Route = createFileRoute("/_authenticated/schools/professionals")({
  beforeLoad: ({ context }) => {
    if (!context.schoolAccess.schools.length) throw notFound();
  },
  head: () => ({ meta: [{ title: "Profissionais · SOE" }] }),
  component: function StaffSchoolsRoute() {
    return (
      <StaffSchoolsPage
        schools={Route.useRouteContext().schoolAccess.schools}
      />
    );
  },
});
