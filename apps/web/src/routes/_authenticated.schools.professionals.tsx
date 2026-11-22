import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/_authenticated/schools/professionals")({
  beforeLoad: ({ context }) => {
    if (!context.schoolAccess.schools.length) throw notFound();
    throw redirect({ to: "/schools", replace: true });
  },
});
