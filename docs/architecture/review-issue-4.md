# Revisão da issue #4 — MFA

Base: `2384c59a31e26708c31c4ed205cfe506745602eb`, branch `feat/session-delivery`.
Especificação: [issue #4](https://github.com/LuisCarlos-git/soe-saas/issues/4),
PRD 1.3, seções 6/7 e requisito de MFA para administração privilegiada e leitura
restrita. Revisão independente nos eixos Standards e Spec, seguida de correções.

## Standards

Dois achados corrigidos: mensagens locais de senha em pt-BR no schema de
apresentação derivado do contrato e botão primário da verificação ocupando a
largura dos campos. Formulários usam AppForm/AppField/SubmitButton de `@soe/form`;
UI preserva DESIGN.md e os componentes existentes. Nenhuma violação adicional
identificada nas rotas implementadas.

## Spec

A jornada foi ampliada para verificar código inválido também no desafio de login,
confirmando 401 na consulta de identidade antes da confirmação válida.

Permanece uma limitação de aceite: ainda não existem operações escolares de
administração/leitura restrita nem vínculos/papéis. O teste de acesso protegido
comprova a barreira MFA diante de um caminho reservado, não uma operação de negócio
real. Não constitui evidência de matriz de perfis ou isolamento entre escolas.
Esses cenários precisam acompanhar a implementação dos módulos correspondentes;
a issue não foi encerrada como integralmente demonstrada.

A fronteira `/api/v1/*` exige MFA por padrão, com exceções exatas para bootstrap
e identidade. A marca persistida é por sessão e não é herdada por cookies antigos.
O caso de uso puro `SessionSecurity.requireMfa` permite compor a pré-condição em
futuros casos de uso; a verificação MFA não concede vínculo ou permissão escolar.
Inscrição e desafio usam o plugin oficial Better Auth 1.7.23, sem SDK no frontend.

## Evidências executadas

- `pnpm build`: geração Prisma, API/OpenAPI, pacotes e web aprovados.
- `pnpm test:unit`: 24 testes aprovados.
- `pnpm test:integration`: 15 testes aprovados, PostgreSQL descartável e migrations
  reais; inclui inscrição, desafio inválido/válido, sessões antigas, isolamento
  entre identidades e eventos MFA na auditoria, sem segredos nos logs.
- `pnpm test:e2e`: 32 testes aprovados (4 UI, 14 form, 14 web).
- Após as correções de revisão, `pnpm --filter @soe/web build` e
  `pnpm exec playwright test apps/web/tests/mfa.spec.ts`: aprovados nos dois
  viewports, incluindo senha vazia em português e desafio de login inválido.
- `pnpm typecheck`, `pnpm lint`, `pnpm architecture:check`, `pnpm format:check`,
  `pnpm bundle:check` e `git diff --check`: aprovados.
- Capturas desktop/celular inspecionadas; Axe sem violações na jornada MFA.
  Detector Impeccable nos novos componentes: nenhum achado mecânico.

Um primeiro teste sem acesso ao Docker falhou por restrição de sandbox; os testes
com banco foram executados com acesso autorizado ao runtime. Uma execução completa
de integração encontrou concorrência entre builds no diretório `.build`; a
reexecução após o build terminou aprovada. A suíte completa E2E usa portas isoladas
43220/43221, preservando o ambiente de desenvolvimento 43120/43121.

## Limites operacionais

Recuperação, desativação/troca de fator e dispositivos confiáveis não estão
expostos nem foram validados. Não há autorização para dados reais ou contratação.
Detalhes da demonstração, endpoints, auditoria e composição de permissões no
[runbook de autenticação](../runbooks/authentication.md#mfa-totp--issue-4).
