import { normalizeNavigationPath } from "../shared/navigation-path";
import { useState, type ReactNode } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@soe/ui/primitives/sidebar";
import type { ApiClient } from "@soe/api-client";
import { ApplicationSidebar, type ShellIdentity } from "./application-sidebar";
export function AuthenticatedShell({
  api,
  identity,
  children,
}: {
  api: ApiClient;
  identity: ShellIdentity;
  children: ReactNode;
}) {
  const pathname = useRouterState({
    select: (state) => normalizeNavigationPath(state.location.pathname),
  });
  const client = useQueryClient();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const settings = pathname.startsWith("/settings");
  async function logout() {
    setPending(true);
    try {
      await api.logout();
      await client.cancelQueries();
      client.clear();
      await router.navigate({ to: "/login" });
    } catch {
      /* Global transport toast retains the current page on failure. */
    } finally {
      setPending(false);
    }
  }
  return (
    <SidebarProvider className="bg-canvas text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:p-3 focus:text-primary"
      >
        Ir para o conteúdo
      </a>
      <ApplicationSidebar
        identity={identity}
        onLogout={() => {
          void logout();
        }}
        pending={pending}
      />
      <SidebarInset className="min-w-0 bg-canvas">
        <header className="flex min-h-16 items-center justify-between gap-3 border-b border-rule bg-surface px-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarTrigger
              aria-label="Abrir menu de navegação"
              className="size-11 md:hidden"
            />
            <nav aria-label="Localização">
              <ol className="flex items-center gap-2 text-sm">
                <li className="text-muted-foreground">
                  {settings ? "Configurações" : "Visão geral"}
                </li>
                {settings && (
                  <>
                    <li aria-hidden="true">
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </li>
                    <li aria-current="page" className="font-medium">
                      {pathname.startsWith("/settings/schools")
                        ? "Escolas"
                        : pathname.endsWith("security")
                          ? "Segurança"
                          : "Perfil"}
                    </li>
                  </>
                )}
              </ol>
            </nav>
          </div>
        </header>
        <div
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-5xl px-4 py-8 outline-none sm:px-8 sm:py-10 lg:px-12"
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
