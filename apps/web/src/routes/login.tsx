import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "../modules/identity";
export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar · SOE" }] }),
  component: () => <LoginPage api={Route.useRouteContext().api} />,
});
