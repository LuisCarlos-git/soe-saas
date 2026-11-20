import { normalizeNavigationPath } from "../shared/navigation-path";
import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, Settings, X } from "lucide-react";
import { Button } from "@soe/ui";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSelection,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@soe/ui/primitives/sidebar";
export type ShellIdentity = { name: string; email: string };
export function ApplicationSidebar({
  identity,
  onLogout,
  pending,
}: {
  identity: ShellIdentity;
  onLogout: () => void;
  pending: boolean;
}) {
  const pathname = useRouterState({
    select: (state) => normalizeNavigationPath(state.location.pathname),
  });
  const { setOpenMobile } = useSidebar();
  const close = () => setOpenMobile(false);
  return (
    <Sidebar
      role="complementary"
      aria-label="Menu lateral"
      className="border-r border-rule"
    >
      <SidebarSelection activeKey={pathname}>
        <SidebarHeader className="px-5 py-6">
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/account"
              onClick={close}
              className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white">
                SOE
              </span>
              <span>
                <span className="block text-base font-semibold tracking-tight">
                  SOE
                </span>
                <span className="block text-xs text-muted-foreground">
                  Acompanhamento escolar
                </span>
              </span>
            </Link>
            <Button
              variant="ghost"
              aria-label="Fechar menu"
              className="size-11 p-0 md:hidden"
              onClick={close}
            >
              <X className="size-5" aria-hidden="true" />
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-3 py-3">
          <nav aria-label="Navegação principal">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/account"}
                  className="h-11 px-3"
                  tooltip="Visão geral"
                >
                  <Link
                    to="/account"
                    onClick={close}
                    aria-current={pathname === "/account" ? "page" : undefined}
                  >
                    <LayoutDashboard aria-hidden="true" />
                    <span>Visão geral</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </nav>
        </SidebarContent>
        <SidebarFooter className="gap-4 p-3 pb-5">
          <nav aria-label="Conta e preferências">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/settings")}
                  className="h-11 px-3"
                >
                  <Link
                    to="/settings/profile"
                    onClick={close}
                    aria-current={
                      pathname.startsWith("/settings") ? "page" : undefined
                    }
                  >
                    <Settings aria-hidden="true" />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </nav>
          <div className="border-t border-rule pt-4">
            <Link
              to="/settings/profile"
              onClick={close}
              className="flex min-h-11 items-center gap-3 rounded-lg px-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {identity.name.trim().slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {identity.name.split(" ")[0]}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {identity.email}
                </span>
              </span>
            </Link>
          </div>
          <Button
            variant="ghost"
            loading={pending}
            onClick={onLogout}
            className="w-full justify-start gap-2 px-3 text-sm font-medium"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sair
          </Button>
        </SidebarFooter>
      </SidebarSelection>
    </Sidebar>
  );
}
