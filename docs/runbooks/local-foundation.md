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

## Caixa de e-mail local

```sh
pnpm mailpit
```

Abra http://127.0.0.1:43124 para consultar as mensagens capturadas. O servidor
SMTP local fica em `127.0.0.1:43125`. O comando inicia somente o Mailpit em
segundo plano e pode ser executado novamente sem criar outro serviço.
O Compose completo também inicia a caixa junto com o PostgreSQL.

Para habilitar o envio de convites, mantenha no `.env` as variáveis abaixo
(já presentes no `.env.example`) e reinicie a API:

```dotenv
INVITATION_MAIL_MODE=development-smtp
INVITATION_SMTP_HOST=127.0.0.1
INVITATION_SMTP_PORT=43125
```

Use `pnpm mailpit:stop` para parar somente a caixa. As mensagens são temporárias
e podem ser perdidas ao recriar o container. O Mailpit captura as mensagens sem
enviá-las a endereços externos; a API permanece responsável pela fila de convites.

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

## Backend e login local

O backend exclusivo fica em apps/api; veja [ADR 0003](../adr/0003-api-local-backend.md). Após o build, `pnpm dev:seed` prepara as duas contas sintéticas locais com senha 12345678 e reinicia seu contador de tentativas. Não há seed automático no boot nem cadastro público. Veja o [runbook de autenticação](authentication.md).

Não inserir dados escolares reais. MFA, permissões por escola e preparação do piloto continuam nas próximas entregas. API e banco são locais; telemetria distribuída pertence ao ticket específico.
