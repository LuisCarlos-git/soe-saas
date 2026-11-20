import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
export const Route = createFileRoute(
  "/_authenticated/settings/schools/$organizationId",
)({
  beforeLoad: ({ context, params }) => {
    if (
      !context.schoolAccess.schools.some(
        (school) => school.id === params.organizationId,
      )
    )
      throw notFound();
    throw redirect({
      to: "/schools/$organizationId/settings",
      params,
      replace: true,
    });
  },
});
