import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Button } from "@soe/ui";
import type { ApiClient } from "@soe/api-client";

export function LoginPage({ api }: { api: ApiClient }) {
  const client = useQueryClient();
  const router = useRouter();
  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      try {
        await api.login(value);
        await client.cancelQueries();
        client.clear();
        await router.navigate({ to: "/account" });
      } catch {
        // The HTTP client reports errors through the global toast adapter.
      }
    },
  });
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6 py-12 text-ink">
      <section
        aria-labelledby="login-title"
        className="w-full max-w-md rounded-xl border border-rule bg-surface p-6 sm:p-8"
      >
        <p className="text-xl font-semibold text-primary">SOE</p>
        <h1
          id="login-title"
          className="mt-8 text-3xl font-semibold tracking-tight"
        >
          Entrar na plataforma
        </h1>
        <p className="mt-3 leading-relaxed text-muted">
          Use o acesso fornecido pela equipe responsável.
        </p>
        <form
          className="mt-8 space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.Field name="email">
            {(field) => (
              <div>
                <label htmlFor="email" className="mb-2 block font-medium">
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  maxLength={254}
                  className="min-h-11 w-full rounded-lg border border-control bg-surface px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </div>
            )}
          </form.Field>
          <form.Field name="password">
            {(field) => (
              <div>
                <label htmlFor="password" className="mb-2 block font-medium">
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  maxLength={128}
                  className="min-h-11 w-full rounded-lg border border-control bg-surface px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </div>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(pending) => (
              <Button type="submit" disabled={pending}>
                {pending ? "Entrando…" : "Entrar"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </section>
    </main>
  );
}
