import { createFileRoute, redirect } from "@tanstack/react-router";
import { AccountPage, sessionQuery } from "../modules/identity";
export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "Sua sessão · SOE" }] }),
  loader: async ({ context }) => {
    const identity = await context.queryClient.fetchQuery(
      sessionQuery(context.api),
    );
    if (!identity) throw redirect({ to: "/login" });
  },
  errorComponent: ({ reset }) => (
    <main className="min-h-screen bg-canvas p-6 text-ink">
      <h1 className="text-2xl font-semibold">
        Não foi possível verificar sua sessão
      </h1>
      <p className="my-4 text-muted">Confira a conexão e tente novamente.</p>
      <button
        type="button"
        className="min-h-11 rounded-lg bg-primary px-4 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={reset}
      >
        Verificar novamente
      </button>
    </main>
  ),
  component: () => <AccountPage api={Route.useRouteContext().api} />,
});
