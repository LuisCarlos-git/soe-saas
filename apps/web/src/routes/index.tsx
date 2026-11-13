import { createFileRoute } from "@tanstack/react-router";
import { EnvironmentPage, environmentQuery } from "../modules/environment";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await context.queryClient
      .ensureQueryData(environmentQuery(context.api))
      .catch(() => undefined);
  },
  component: () => <EnvironmentPage api={Route.useRouteContext().api} />,
});
