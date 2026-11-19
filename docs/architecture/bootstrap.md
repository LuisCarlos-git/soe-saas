# Bootstrap da primeira fatia

> Registro histórico da issue #2. A arquitetura atual é definida pela [ADR 0003](../adr/0003-api-local-backend.md) e pela [estrutura da API](api-structure.md); os caminhos de pacotes backend abaixo não são mais vigentes.

Escopo: issue #2, primeiro percurso Start → NestJS → PostgreSQL. Não há dados
escolares, autenticação, organizações ou worker nesta entrega. A tabela de probe
é técnica, global, com uma única linha sintética e constraints que impedem
alterar seu identificador/conteúdo. Não representa entidade escolar sem tenant.

## Origem oficial dos apps

As bases foram efetivamente geradas em diretório temporário com as CLIs oficiais:

```sh
# Executado em /private/tmp/soe-cli-foundation
pnpm dlx @nestjs/cli@11.0.24 new soe-api --directory api --package-manager pnpm --skip-git --skip-install --strict
pnpm dlx @tanstack/cli@0.72.16 create soe-web --framework React --build-tool vite --target-dir /private/tmp/soe-cli-foundation/web --package-manager pnpm --add-ons tanstack-query --toolchain eslint --no-examples --no-install --no-git --no-intent --yes
```

Nest mantém `nest-cli.json`, `tsconfig.build.json`, bootstrap e composição do app,
com `nest build`. O exemplo Hello World foi substituído pelo percurso real.
O web conserva configuração Vite/Start, árvore de rotas gerada e integração SSR
de Query do template oficial. Providers e transporte foram adaptados ao cliente
HTTP do workspace e instâncias por requisição. Não se copiou o workspace interno
do template nem seu lockfile: a instalação pertence à raiz pnpm/Turbo.

Os manifests foram adaptados para exports/dependências explícitas e versões
exatas. ESM/NodeNext no backend e Bundler no web; TypeScript 6.0.3 foi escolhido
porque typescript-eslint 8.72.2 ainda não suporta TypeScript 7. Nest 11.2.10 é
compatível com nestjs-zod 5.6.0; Nest 12 não atende os peers desse adapter.

## Fronteiras

| Origem                 | Destino autorizado                              |
| ---------------------- | ----------------------------------------------- |
| Web/rotas              | API pública do módulo web e cliente HTTP neutro |
| Cliente HTTP           | Contratos Zod                                   |
| Controller API         | Aplicação backend pública e contratos HTTP      |
| Aplicação backend      | Porta própria, sem Nest, Prisma ou Zod HTTP     |
| Infraestrutura backend | Porta de aplicação e factory database           |
| Composição Nest        | Factories, tokens, adapters e ciclo de shutdown |

O SSR usa upstream loopback fixo. O servidor Node faz ingress local da API,
sem decisões de negócio, destino derivado da requisição ou captura de credenciais.
Não há cookies escolares para encaminhar nesta fatia; autenticação futura deve
introduzir a allowlist correspondente. A página e a API sintéticas são públicas
e não expõem dados pessoais ou topologia. Cache de resposta é `no-store`.

Prisma usa adapter PostgreSQL com limites de pool, conexão, query e statement.
Readiness lê a linha migrada pelo adapter backend; liveness não consulta banco.
Erros públicos são seguros, correlacionados, sem stack, SQL ou conexão. Logs
Pino descartam request/headers/query/body e saneiam erros por allowlist.

## Testes e geração

O helper neutro Testcontainers inicia PostgreSQL 17.9-alpine efêmero e entrega a
URL. As suítes consumidoras executam o deploy das migrações com essa URL explícita;
não leem URL de produção nem usam `db push`. Falha do Docker
é falha do teste, sem fallback. Testes consultam a API pública, incluindo pause
do container, readiness 503 e recuperação, com conexão limitada a 1,5 segundo.

O contrato Zod gera DTOs Nest e OpenAPI. O build publica OpenAPI como artefato;
Swagger UI não é exposto. Vitest cobre configuração pura; Jest/Supertest cobre
HTTP/Nest/banco e saneamento; Playwright usa builds reais em desktop/celular.

Dependency-cruiser verifica código autoral e rejeita fixtures negativas de import
backend no web, Nest na aplicação pura e acesso a internals de outro pacote.
O bloqueio de pacotes de servidor reconhece tanto os nomes públicos quanto os
caminhos resolvidos, funcionando antes de existirem builds locais. Isso foi
validado removendo temporariamente os outputs gerados do grafo e restaurando-os
após o check. O cliente Prisma e a árvore de rotas são gerados e ficam fora
da verificação de ciclos: ambos contêm referências de tipos próprias do gerador.
A árvore do Router é produzida pelo build e nunca editada manualmente.
O bundle cliente é inspecionado separadamente para dependências/URLs de servidor.

## Referências consultadas

- [TanStack CLI](https://tanstack.com/cli/latest/docs/cli-reference)
- [Nest CLI](https://docs.nestjs.com/cli/usages)
- [Start/Vite](https://tanstack.com/start/latest/docs/framework/react/build-from-scratch)
- [Start hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting)
- [Prisma 7: migrações](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/development-and-production)
- [Prisma 7: adapter PostgreSQL](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/postgresql)
- [Terminus](https://docs.nestjs.com/recipes/terminus)
- [nestjs-zod](https://github.com/BenLorantfy/nestjs-zod)
- [nestjs-pino](https://github.com/iamolegga/nestjs-pino)
- Docs embarcadas do Turbo 2.11.10: configuração de tarefas e ambiente.

Os links sem versão são referências de mecanismos; a integração usa as versões
exatas dos manifests/lockfile, validadas pelos checks desta fatia.
