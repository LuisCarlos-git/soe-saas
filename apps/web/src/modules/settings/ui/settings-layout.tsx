import { normalizeNavigationPath } from "../../../shared/navigation-path";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { ShieldCheck, UserRound } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@soe/ui/primitives/tabs";
const sections = [
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
  const pathname = useRouterState({
    select: (state) => normalizeNavigationPath(state.location.pathname),
  });
  const navigate = useNavigate();
  const active =
    sections.find((section) => section.path === pathname)?.value ?? "profile";
  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Configurações</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
          Gerencie seus dados de acesso e a segurança da sua conta.
        </p>
      </header>
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
            aria-label="Configurações da conta"
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
        <TabsContent
          key={active}
          value={active}
          className="soe-route-content pt-8"
        >
          <Outlet />
        </TabsContent>
      </Tabs>
    </>
  );
}
