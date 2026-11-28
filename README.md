# SOE SaaS

SaaS de acompanhamento educacional em construção. Inclui diagnóstico sintético, login/MFA, escolas piloto e convites de profissionais por e-mail de desenvolvimento. Ainda não há autorização para dados escolares reais.

## Desenvolvimento

Pré-requisitos: Node 24.22.1, pnpm 11.25.0 e Docker. Na raiz:

```sh
pnpm install --frozen-lockfile
cp .env.example .env
# Não sobrescrever .env se já tiver configuração local.
docker compose -f infra/compose.yaml up -d --wait
pnpm db:generate
pnpm db:migrate:deploy
pnpm build
pnpm dev:seed
pnpm dev
```

Abra http://127.0.0.1:43120/login. Contas locais sintéticas: ana@example.test ou bia@example.test, senha 12345678. `pnpm dev:seed` é restrito ao Compose de desenvolvimento, idempotente e reinicia o contador de tentativas local. Não há cadastro público. A API usa http://127.0.0.1:43121.

## E-mail local

Para iniciar somente a caixa de e-mail local, execute `pnpm mailpit` e abra
http://127.0.0.1:43124. O SMTP escuta em `127.0.0.1:43125`; os e-mails ficam no
Mailpit, sem entrega externa. Para parar, use `pnpm mailpit:stop`.
Se o seu `.env` já existia, adicione as variáveis `INVITATION_*` do
[exemplo](.env.example) e reinicie a API para habilitar os envios locais.

## Organização

- `apps/web`: TanStack Start/React; erros de API apresentados pelo Sonner global com richColors.
- `apps/api`: NestJS, domain, use-cases, repositories, factories, Prisma, migrations, CLIs e testes backend. Imports internos sem extensão; TypeScript/Nest + esbuild geram bundles ESM Node.
- `packages`: contracts, api-client neutro, ui, form, templates React Email e configurações independentes compartilhadas.

## Documentação

- [PRD e decisões atuais](docs/PRD.md)
- [Arquitetura aprovada](docs/adr/0003-api-local-backend.md)
- [Estrutura da API e feedback de erros](docs/architecture/api-structure.md)
- [Desenvolvimento local](docs/runbooks/local-foundation.md)
- [Autenticação e demonstração temporária](docs/runbooks/authentication.md)
- [Teste manual dos convites pela interface](docs/runbooks/invitations.md)
- [Decisões de produto](docs/product/decisions.md)
- [Glossário](GLOSSARY.md)

## Checks

`pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm architecture:check`, `pnpm test:unit`, `pnpm test:integration`, `pnpm build`, `pnpm bundle:check` e `pnpm test:e2e`.
Integração/E2E exigem Docker e usam bancos temporários com migrations reais. E2E exige portas 43120/43121 livres; encerre `pnpm dev` antes de executá-lo.
