# Backend convencional dentro de apps/api

Decisão aprovada explicitamente pelo responsável pelo produto em 14/11/2026: todo código exclusivo do backend passa para apps/api, incluindo Prisma, migrations, autenticação, casos de uso, domínio, repositórios, factories e suporte de testes. Esta decisão substitui a distribuição de backend/database/test-utils em packages e a premissa de compartilhamento futuro entre apps das seções 7 e 16 do PRD. Não há worker implementado; jobs futuros serão compostos a partir da própria API até uma nova necessidade validada.

Cada módulo agrupa domain, repositories (contratos), use-cases, infrastructure (implementações), factories e controllers. Domain, repositories e use-cases são TypeScript puro; Nest compõe por constructor injection e factories. Prisma só aparece em infraestrutura/factories. A conexão é única por instância de aplicação e tem encerramento controlado. Não criar GenericRepository, BaseService ou abstrações sem consumidor real.

Packages ficam reservados a código independente ou compartilhável: contracts, ui, api-client neutro e configurações comuns. Nenhum pacote importa apps; o web acessa a API somente por HTTP. Testes, migrations e CLIs backend ficam na API. Continuam obrigatórios isolamento por escola, autorização no servidor, auditoria transacional, pnpm/Turbo, NestJS, Prisma/PostgreSQL e checagens de fronteiras.

Erros seguros de resposta da API são apresentados por padrão pelo Toaster Sonner global com richColors. O transporte continua neutro e recebe um callback de notificação no cliente; SSR nunca dispara toast. Validadores locais podem manter mensagens associadas aos campos; um erro de API não deve gerar toast e mensagem duplicados.

Backend usa module=ESNext e moduleResolution=Bundler, com imports internos sem extensão. O build Nest/TypeScript emite metadados de decorators em .build; esbuild 0.28.2 gera bundles ESM Node 24 em dist, com dependências de pacotes externas e sourcemaps. Não transpilar decorators diretamente com esbuild: isso perderia emitDecoratorMetadata necessário à validação HTTP do Nest. .build e cliente Prisma gerado não são fontes versionadas.
