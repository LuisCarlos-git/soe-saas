# Executar o percurso sintético local

Pré-requisitos: Node 24.22.1, pnpm 11.25.0 e Docker disponível. Todas as URLs,
senhas e registros abaixo são exemplos locais sintéticos; não usar dados reais.

```sh
pnpm install --frozen-lockfile
cp .env.example .env
docker compose -f infra/compose.yaml up -d --wait
pnpm db:generate
DATABASE_URL=postgresql://soe:soe_local_only@127.0.0.1:54329/soe_dev pnpm db:migrate:deploy
pnpm build
pnpm dev
```

A página fica em http://127.0.0.1:43120 e a API em http://127.0.0.1:43121.
O dev da API carrega o `.env` da raiz. Em outra janela:

```sh
curl -i http://127.0.0.1:43121/health/live
curl -i http://127.0.0.1:43121/health/ready
curl -i http://127.0.0.1:43121/api/v1/environment
```

Live deve continuar 200 se o PostgreSQL cair. Ready e consulta sintética retornam
503 seguro quando a linha migrada não pode ser consultada. Inicie o banco e aplique
as migrações antes de investigar a página. Para simular indisponibilidade somente
no Compose de desenvolvimento, use `docker compose -f infra/compose.yaml stop postgres`;
`up -d --wait` restabelece o serviço. Nunca use esse procedimento em produção.

## Verificação

```sh
pnpm format:check
pnpm lint
pnpm architecture:check
pnpm typecheck
pnpm test:unit
pnpm test:integration
pnpm build
pnpm bundle:check
pnpm exec playwright install chromium
pnpm test:e2e
```

Integração e E2E criam seus próprios containers temporários, aplicam migrações
reais e os encerram. Não usam o banco do `.env`. E2E exige portas 43120/43121
livres e compilações recentes; não reutiliza um servidor aberto. Os screenshots
são evidência local em test-results; o CI também publica o OpenAPI gerado.

Para servir o build, inicie API e web separadamente. A API exige configuração
validada passada pelo ambiente ou `node --env-file=../../.env dist/main.js`
dentro do app; o web usa `pnpm --filter @soe/web start`.

## Limites da entrega

Sem autenticação, escolas, estudantes, auditoria escolar, storage de anexos,
e-mail ou worker. Nenhum módulo futuro foi criado vazio. A única tabela é uma
fixture global protegida por constraints, sem dados de escola ou estudante.
O operador pode investigar requests por correlationId nos logs saneados; nunca
adicionar query/body/cookies à coleta. Telemetria distribuída pertence ao ticket
específico; a infraestrutura desta fatia não representa autorização de piloto real.
