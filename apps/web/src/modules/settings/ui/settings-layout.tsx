import { PageToolbar } from "@soe/ui/components/page-toolbar";
import { normalizeNavigationPath } from "../../../shared/navigation-path";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { ShieldCheck, UserRound } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@soe/ui/primitives/tabs";
const accountSections = [
  {
    value: "profile",
    label: "Perfil",
    path: "/settings/profile",
    icon: UserRound,
  },
  {
    value: "security",
    label: "Segurança",
    path: "/settings/security",
    icon: ShieldCheck,
  },
] as const;
export function SettingsLayout() {
  const sections = accountSections;
  const pathname = useRouterState({
    select: (state) => normalizeNavigationPath(state.location.pathname),
  });
  const navigate = useNavigate();
  const active =
    sections.find(
      (section) =>
        section.path === pathname || pathname.startsWith(`${section.path}/`),
    )?.value ?? "profile";
  return (
    <>
      <PageToolbar
        className="mb-6"

        description="Gerencie seus dados de acesso e a segurança da sua conta."
      />
      <Tabs
        value={active}
        activationMode="manual"
        onValueChange={(value) => {
          const section = sections.find((item) => item.value === value);
          if (section) void navigate({ to: section.path });
        }}
        className="gap-0"
      >
        <div className="overflow-x-auto border-b border-rule">
          <TabsList
            variant="line"
            aria-label="Seções de configurações"
            className="gap-6 rounded-none p-0 group-data-[orientation=horizontal]/tabs:h-12"
          >
            {sections.map((section) => (
              <TabsTrigger
                key={section.value}
                value={section.value}
                className="min-h-11 flex-none gap-2 rounded-none px-1 text-muted-foreground data-[state=active]:text-primary after:bg-primary group-data-[orientation=horizontal]/tabs:after:bottom-0 focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
              >
                <section.icon className="size-4" aria-hidden="true" />
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value={active} className="soe-route-panel pt-8">
          <div key={pathname} className="soe-route-content">
            <Outlet />
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
