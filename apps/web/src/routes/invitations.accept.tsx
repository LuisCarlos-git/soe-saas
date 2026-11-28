import { createFileRoute } from "@tanstack/react-router";
import { AcceptInvitationPage } from "../modules/staff";
import { InvitationSignIn, MfaSettings } from "../modules/identity";
export const Route = createFileRoute("/invitations/accept")({
  head: () => ({
    meta: [
      { title: "Aceitar convite · SOE" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: function InvitationRoute() {
    const { api } = Route.useRouteContext();
    return (
      <AcceptInvitationPage
        api={api}
        renderSignIn={(email, complete) => (
          <InvitationSignIn
            key={email}
            api={api}
            email={email}
            onAuthenticated={complete}
          />
        )}
        renderMfa={(complete) => (
          <MfaSettings api={api} onVerified={complete} embedded />
        )}
      />
    );
  },
});
