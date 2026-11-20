import { createFileRoute } from "@tanstack/react-router";
import { AccountPage } from "../modules/identity";
export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Visão geral · SOE" }] }),
  component: () => <AccountPage api={Route.useRouteContext().api} />,
});
