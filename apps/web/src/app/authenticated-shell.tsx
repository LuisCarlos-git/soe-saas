import { pageHeading } from "./page-heading";
import { buttonVariants } from "@soe/ui/primitives/button";
import { normalizeNavigationPath } from "../shared/navigation-path";
import { useState, type ReactNode } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@soe/ui/primitives/sidebar";
import type { ApiClient } from "@soe/api-client";
import type { SchoolAccess } from "@soe/contracts";
import { ApplicationSidebar, type ShellIdentity } from "./application-sidebar";
export function AuthenticatedShell({
  api,
  identity,
  schoolAccess,
  children,
}: {
  api: ApiClient;
  identity: ShellIdentity;
  schoolAccess: SchoolAccess;
  children: ReactNode;
}) {
  const pathname = useRouterState({
    select: (state) => normalizeNavigationPath(state.location.pathname),
  });
  const client = useQueryClient();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const heading = pageHeading(pathname);
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
        schoolAccess={schoolAccess}
        onLogout={() => {
          void logout();
        }}
        pending={pending}
      />
      <SidebarInset className="min-w-0 bg-canvas">
        <header className="flex min-h-16 items-center gap-1 border-b border-rule bg-surface px-4 py-2 sm:px-8">
          <SidebarTrigger
            aria-label="Abrir menu de navegação"
            className="size-10 shrink-0 p-0 md:hidden"
          />
          {heading.back && (
            <Link
              to={heading.back}
              aria-label={heading.backLabel}
              title={heading.backLabel}
              className={buttonVariants({
                variant: "ghost",
                size: "icon",
                className: "size-10 shrink-0 text-muted-foreground",
              })}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
          )}
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 px-1">
            <h1 className="text-lg font-semibold leading-6 tracking-tight">
              {heading.title}
            </h1>
            {heading.section && (
              <nav
                aria-label="Localização"
                className="text-sm text-muted-foreground"
              >
                {heading.section}
              </nav>
            )}
          </div>
        </header>
        <div
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-6xl px-4 py-6 outline-none sm:px-8 lg:px-12"
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
