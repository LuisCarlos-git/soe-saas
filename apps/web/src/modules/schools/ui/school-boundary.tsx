import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ApiClient } from "@soe/api-client";
import { Button } from "@soe/ui";
export function SchoolBoundary({
  api,
  actorId,
  allowed,
  children,
}: {
  api: ApiClient;
  actorId: string;
  allowed: boolean;
  children: ReactNode;
}) {
  const mfa = useQuery({
    queryKey: ["mfa", actorId],
    queryFn: () => api.mfaStatus(),
    retry: false,
    enabled: allowed,
  });
  if (!allowed)
    return (
      <p className="text-muted-foreground">
        Você não tem permissão para administrar escolas.
      </p>
    );
  if (mfa.isPending) return <p role="status">Verificando sua identidade…</p>;
  if (mfa.isError)
    return (
      <div>
        <p>Não foi possível verificar sua identidade.</p>
        <Button
          className="mt-4"
          onClick={() => {
            void mfa.refetch();
          }}
        >
          Tentar novamente
        </Button>
      </div>
    );
  if (!mfa.data.verified)
    return (
      <section className="max-w-xl space-y-4">
        <h2 className="text-xl font-semibold">
          Confirme sua identidade para continuar
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          A administração de escolas exige a proteção em duas etapas nesta
          sessão.
        </p>
        <Link
          to="/settings/security"
          className="inline-flex min-h-11 items-center font-medium text-primary underline underline-offset-4"
        >
          Abrir configurações de segurança
        </Link>
      </section>
    );
  return children;
}
