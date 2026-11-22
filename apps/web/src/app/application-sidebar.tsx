import { normalizeNavigationPath } from "../shared/navigation-path";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  School,
  LayoutDashboard,
  LogOut,
  Settings,
  X,
} from "lucide-react";
import type { SchoolAccess } from "@soe/contracts";
import { Button } from "@soe/ui";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSelection,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@soe/ui/primitives/sidebar";
export type ShellIdentity = { name: string; email: string };
export function ApplicationSidebar({
  identity,
  schoolAccess,
  onLogout,
  pending,
}: {
  identity: ShellIdentity;
  schoolAccess: SchoolAccess;
  onLogout: () => void;
  pending: boolean;
}) {
  const pathname = useRouterState({
    select: (state) => normalizeNavigationPath(state.location.pathname),
  });
  const { setOpenMobile } = useSidebar();
  const close = () => setOpenMobile(false);
  const schoolPage =
    pathname === "/schools" || pathname.startsWith("/schools/");
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
          {schoolAccess.schools.length > 0 && (
            <SidebarGroup className="mt-4 p-0">
              <SidebarGroupLabel className="px-3 text-xs font-medium text-muted-foreground">
                Escola
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <nav aria-label="Escola">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={schoolPage}
                        className="h-11 px-3"
                      >
                        <Link
                          to="/schools"
                          onClick={close}
                          aria-current={schoolPage ? "page" : undefined}
                        >
                          <School aria-hidden="true" />
                          <span>Minhas escolas</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </nav>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
          {schoolAccess.canProvisionSchools && (
            <SidebarGroup className="mt-4 p-0">
              <SidebarGroupLabel className="px-3 text-xs font-medium text-muted-foreground">
                Administração
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <nav aria-label="Administração">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(
                          "/administration/schools",
                        )}
                        className="h-11 px-3"
                      >
                        <Link
                          to="/administration/schools"
                          onClick={close}
                          aria-current={
                            pathname.startsWith("/administration/schools")
                              ? "page"
                              : undefined
                          }
                        >
                          <Building2 aria-hidden="true" />
                          <span>Escolas piloto</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </nav>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
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
          <div className="flex items-center gap-1 border-t border-rule pt-4">
            <Link
              to="/settings/profile"
              onClick={close}
              className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-lg px-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
            <Button
              variant="ghost"
              loading={pending}
              onClick={onLogout}
              aria-label="Sair"
              title="Sair"
              className="size-11 shrink-0 p-0"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </SidebarFooter>
      </SidebarSelection>
    </Sidebar>
  );
}
