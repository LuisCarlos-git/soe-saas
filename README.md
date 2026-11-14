# SOE SaaS

Primeira fatia: verificação sintética Start → NestJS → Prisma/PostgreSQL.
Os apps foram gerados pelas CLIs oficiais NestJS e TanStack e adaptados ao
workspace pnpm/Turborepo. Ainda não há funcionalidades escolares ou dados reais.

## Desenvolvimento

Siga [o runbook local](docs/runbooks/local-foundation.md) para instalar, iniciar
PostgreSQL, aplicar migrações e abrir a página em http://127.0.0.1:43120.
A API local usa http://127.0.0.1:43121.

## Documentação

- [PRD e restrições do produto](docs/PRD.md)
- [Decisões confirmadas](docs/product/decisions.md)
- [Glossário](GLOSSARY.md)
- [Bootstrap oficial e fronteiras](docs/architecture/bootstrap.md)
- [Spec principal](https://github.com/LuisCarlos-git/soe-saas/issues/1)
- [Ticket desta entrega](https://github.com/LuisCarlos-git/soe-saas/issues/2)

## Checks

`pnpm lint`, `pnpm typecheck`, `pnpm architecture:check`, `pnpm test:unit`,
`pnpm test:integration`, `pnpm build`, `pnpm bundle:check` e `pnpm test:e2e`.
Integração/E2E exigem Docker e usam bancos temporários com migrações reais.
