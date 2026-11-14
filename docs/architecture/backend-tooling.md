# Compatibilidade da autenticação — issue #3

Validado em 14/11/2026: Node 24.22.1, pnpm 11.25.0, NestJS 11.2.10, Prisma/CLI/adapter-pg 7.10.1, PostgreSQL 17.9, Better Auth e @better-auth/prisma-adapter 1.7.23, Zod 4.6.7. Dependências diretas exatas e lockfile único. TanStack Form 1.33.5 integra o formulário; Router/Query/Start mantêm as versões do bootstrap.

A CLI oficial `pnpm dlx auth@1.7.23 generate --config packages/backend/auth.schema.ts --output /tmp/soe-auth-schema.prisma --yes` gerou os modelos do provedor. Foram incorporados ao schema existente sem substituir generator/config Prisma 7. `prisma migrate diff --from-schema ... --to-schema ... --script` gerou a migração, acrescida da auditoria transacional. O arquivo de configuração da CLI é apenas fonte de geração, sem conexão ou segredo. Não executar novamente sobre o schema completo sem revisar a diferença.

O adapter Prisma do provedor documenta suporte ao Prisma 7. Não adotamos wrapper Nest comunitário: a API monta o handler oficial e valida seu contrato público. Entrada Zod e documentação OpenAPI derivam dos mesmos contratos; saída de sessão é uma projeção explícita. Domain/application não importam o SDK. Uma porta de leitura de sessão protege o caso de uso de identidade; a composição Nest controla o encerramento do pool.

Rate limiting do handler é habilitado também em desenvolvimento, com storage PostgreSQL, operações condicionais atômicas do adapter 1.7.23 e limites configuráveis em segundos. Não usamos memória por instância nem adicionamos Redis. No ingress local todas as chamadas têm o IP do socket da borda: o limite é conservador e agregado; não promete distinguir usuários atrás dessa borda. `trust proxy=false`; X-Forwarded-For e X-SOE-Client-IP recebidos nunca determinam identidade. Antes de outra topologia, definir e testar uma borda confiável; não habilitar trust proxy irrestrito.

Fontes oficiais consultadas:

- [NestJS integration](https://better-auth.com/docs/integrations/nestjs)
- [Prisma adapter](https://better-auth.com/docs/adapters/prisma)
- [Email e senha](https://better-auth.com/docs/authentication/email-password)
- [Segurança e chamadas server-side](https://better-auth.com/docs/reference/security)
- [Rate limiting](https://better-auth.com/docs/concepts/rate-limit)
- [Sessões](https://better-auth.com/docs/concepts/session-management)
- [Cookies](https://better-auth.com/docs/concepts/cookies)

MFA, convites e recuperação de acesso não estão entregues nesta fatia. O provedor possui plugin de MFA; a integração efetiva e os testes pertencem à issue #4. Não há autorização para dados escolares reais, provedor pago ou uso em produção pelo simples fechamento desta issue.
