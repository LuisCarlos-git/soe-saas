import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Button } from "@soe/ui";
import { sessionQuery } from "../modules/identity";
import { AuthenticatedShell } from "../app/authenticated-shell";
import { schoolAccessQuery } from "../modules/schools";
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ context }) => {
    const identity = await context.queryClient.fetchQuery(
      sessionQuery(context.api),
    );
    if (!identity) throw redirect({ to: "/login" });
    const schoolAccess = await context.queryClient.fetchQuery(
      schoolAccessQuery(context.api, identity.id),
    );
    return { identity, schoolAccess };
  },
  errorComponent: ({ reset }) => (
    <main className="min-h-screen bg-canvas p-6 text-ink">
      <h1 className="text-2xl font-semibold">
        Não foi possível verificar sua sessão
      </h1>
      <p className="my-4 text-muted-foreground">
        Confira a conexão e tente novamente.
      </p>
      <Button onClick={reset}>Verificar novamente</Button>
    </main>
  ),
  component: function AuthenticatedLayout() {
    const { api, identity, schoolAccess } = Route.useRouteContext();
    return (
      <AuthenticatedShell
        api={api}
        identity={identity}
        schoolAccess={schoolAccess}
      >
        <Outlet />
      </AuthenticatedShell>
    );
  },
});
