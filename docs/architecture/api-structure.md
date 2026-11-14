# Organização atual da API e feedback de erros

Decisão do usuário: [ADR 0003](../adr/0003-api-local-backend.md). O backend exclusivo está em `apps/api`; não existem mais os pacotes backend, database ou test-utils. Packages contém contracts, ui, api-client (HTTP neutro), eslint-config e typescript-config.

```text
apps/api/
  prisma/                       schema e migrations existentes, sem recriar histórico
  prisma.config.ts
  src/
    modules/<feature>/
      domain/                   modelos e invariantes puros
      repositories/             contratos pequenos
      use-cases/                intenções independentes de Nest/ORM
      infrastructure/           implementações de repositórios/adapters
      factories/                construção das dependências
      controllers/ ou http/     adapters HTTP
      <feature>.module.ts       composição Nest
    infrastructure/database/    conexão por aplicação e cliente Prisma gerado
    common/                     filtros e DTOs HTTP
    shared/                     configuração e logging
    cli/                        provisionamento sintético protegido
  tests/support/                PostgreSQL temporário exclusivo do backend
```

Repositórios são interfaces orientadas aos consumidores, não wrappers genéricos do Prisma. Factories instanciam adapters e casos de uso. Os módulos Nest registram esses objetos por tokens, sem decorators no domínio/use-cases. A aplicação cria um pool e encerra-o no shutdown. Autenticação continua no handler oficial, preservando CSRF/rate limiting e revogação; não se reimplementa hashing/sessão em use-cases próprios.

O backend usa `module: ESNext` e `moduleResolution: Bundler`, imports relativos sem `.js`. Nest/TypeScript emite JS com metadados em `.build`; esbuild agrupa os entrypoints Node em `dist`. Dependências npm/workspace são externas; instalar dependências de produção continua necessário. O build não acessa dados reais. O dev também executa a etapa Nest + bundle antes de iniciar e usa tsx watch para reconstruir ao alterar src; assim a validação por metadados não diverge da produção. Prisma/schema/migrations passam a ser executados por `pnpm --filter @soe/api db:*`; aliases da raiz são preservados. Não editar o cliente Prisma gerado.

Erros da API: `api-client` valida o envelope e lança `ApiError`. A composição do Router no navegador injeta `notifyApiError`; SSR não recebe esse adapter. Há um único Sonner Toaster no documento raiz, `richColors`, fechar acessível em português e mensagem segura da API. IDs por código evitam duplicar erros idênticos em retries. O mesmo fluxo atende queries e chamadas imperativas/mutações; não exige catch com toast em cada página. Cancelamento e sessão ausente (401 na consulta de identidade) são estados normais. Validação de campo permanece junto ao campo. Estados persistentes de indisponibilidade podem explicar recuperação sem repetir o texto da API inline.

Referências de interface consultadas: skills ui-ux-pro-max, frontend-design, frontend-ui-engineering, interface-design, Impeccable 4.8.2 e Taste 2.5.1. Mantida identidade verde existente. Sonner foi adaptado do padrão [shadcn Radix/Sonner](https://ui.shadcn.com/docs/components/radix/sonner), com [documentação do projeto](https://github.com/emilkowalski/sonner). Consultado [Toast open/close do Transitions.dev](https://transitions.dev/); preservado o movimento nativo do Sonner e sua regra reduced-motion, sem outro motor/receita ou efeitos adicionais. Nenhuma ilustração adicionada.

Fronteiras executáveis rejeitam: API no web, SDK em domain/repository/use-case, ORM em controller e app importado por pacote. Os testes de integração usam migrations reais de `apps/api/prisma`; testes E2E exercitam bundles Node reais, SSR independente e toasts de erro no desktop/celular.

## Verificação desta alteração

Executado localmente: build de todos os apps/pacotes e bundles Node; 14 testes de integração em PostgreSQL descartável; 4 testes unitários; 4 E2E em desktop/360 px com reduced-motion, Axe sem violações e toasts richColors. O vermelho padrão do Sonner falhou no contraste e foi substituído pelos tokens semânticos do SOE. As capturas de login e identificação foram geradas em test-results e a captura móvel com toast foi inspecionada visualmente.

Checagens arquiteturais incluem cinco fixtures negativas. Typecheck, lint e inspeção do bundle cliente passaram. As migrations movidas foram comparadas byte a byte com as anteriores, sem alteração de SQL/histórico. O dev foi iniciado de verdade: readiness 200, query inválida 400 (metadados de DTO preservados), login 200. Hot reload foi exercitado ao alterar o mtime de src/main.ts, com um reinício e retorno da aplicação, sem observar dist/.build em loop. O processo da verificação foi encerrado para liberar as portas do desenvolvedor. Estes são resultados locais, não execução de CI remoto.
