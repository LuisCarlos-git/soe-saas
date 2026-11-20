import { UserRound } from "lucide-react";
export function ProfileSettings({
  identity,
}: {
  identity: { name: string; email: string };
}) {
  return (
    <section
      aria-labelledby="profile-title"
      className="rounded-xl border border-rule bg-surface p-6 sm:p-8"
    >
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UserRound className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 id="profile-title" className="text-xl font-semibold">
            Seu perfil
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Sua identificação na plataforma SOE.
          </p>
        </div>
      </div>
      <dl className="mt-8 divide-y divide-rule border-y border-rule">
        <div className="grid gap-2 py-5 sm:grid-cols-[160px_1fr]">
          <dt className="text-sm text-muted-foreground">Nome</dt>
          <dd className="font-medium">{identity.name}</dd>
        </div>
        <div className="grid gap-2 py-5 sm:grid-cols-[160px_1fr]">
          <dt className="text-sm text-muted-foreground">E-mail de acesso</dt>
          <dd className="break-all font-medium">{identity.email}</dd>
        </div>
      </dl>
      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Para atualizar seus dados, fale com o responsável pelo seu acesso na
        escola.
      </p>
    </section>
  );
}
