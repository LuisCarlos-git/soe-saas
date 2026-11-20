import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/_authenticated/settings/schools/")({
  beforeLoad: ({ context }) => {
    if (context.schoolAccess.canProvisionSchools)
      throw redirect({ to: "/administration/schools", replace: true });
    if (context.schoolAccess.schools.length)
      throw redirect({ to: "/schools", replace: true });
    throw notFound();
  },
});
