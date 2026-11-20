import { createFileRoute } from "@tanstack/react-router";
import { SettingsLayout } from "../modules/settings";
export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Configurações · SOE" }] }),
  component: function SettingsRoute() {
    const { schoolAccess } = Route.useRouteContext();
    return (
      <SettingsLayout
        showSchools={
          schoolAccess.canProvisionSchools || schoolAccess.schools.length > 0
        }
      />
    );
  },
});
