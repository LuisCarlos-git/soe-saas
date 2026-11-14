# SOE SaaS

SaaS de acompanhamento educacional em construção. As entregas atuais incluem diagnóstico sintético, login, sessão revogável e logout. Ainda não há autorização para dados escolares reais.

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

## Organização

- `apps/web`: TanStack Start/React; erros de API apresentados pelo Sonner global com richColors.
- `apps/api`: NestJS, domain, use-cases, repositories, factories, Prisma, migrations, CLIs e testes backend. Imports internos sem extensão; TypeScript/Nest + esbuild geram bundles ESM Node.
- `packages`: somente contracts, api-client neutro, ui e configurações independentes compartilhadas.

## Documentação

- [PRD e decisões atuais](docs/PRD.md)
- [Arquitetura aprovada](docs/adr/0003-api-local-backend.md)
- [Estrutura da API e feedback de erros](docs/architecture/api-structure.md)
- [Desenvolvimento local](docs/runbooks/local-foundation.md)
- [Autenticação e demonstração temporária](docs/runbooks/authentication.md)
- [Decisões de produto](docs/product/decisions.md)
- [Glossário](GLOSSARY.md)

## Checks

`pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm architecture:check`, `pnpm test:unit`, `pnpm test:integration`, `pnpm build`, `pnpm bundle:check` e `pnpm test:e2e`.
Integração/E2E exigem Docker e usam bancos temporários com migrations reais. E2E exige portas 43120/43121 livres; encerre `pnpm dev` antes de executá-lo.
