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

## Ajuste solicitado em 20/11 — modal e QR code

Inscrição, confirmação do primeiro código e desafio de login passam a usar uma
modal compartilhada sobre o Dialog existente de `@soe/ui`. A ação de configuração
continua em `/account`. A modal tem título e descrição acessíveis, fechamento por
Escape e botão “Fechar”, retorno de foco e rolagem limitada à viewport.
O material de inscrição é desmontado ao fechar; a reabertura não conserva senha,
chave nem QR anteriores. A etapa do QR recebe foco nas instruções, sem validar o
código antes da interação.

qrcode.react 4.2.0 gera o QR localmente a partir da URI oficial. **SOe** é o emissor
exibido pelo autenticador, mantendo a chave secreta aleatória do provedor.
Configuração manual permanece disponível em “Não consegue escanear?”.

A jornada Playwright decodifica o SVG com jsQR, confere o emissor SOe, usa a chave
decodificada para autenticar pela API real e verifica novo material ao reabrir,
Escape, foco e acessibilidade em desktop/celular. Revisões independentes Standards
e Spec do delta: nenhum achado pendente. Tipo, lint, arquitetura, formatação e
bundle aprovados; testes unitários (24) e de integração (15) aprovados novamente.

A revisão visual separou escaneamento e confirmação em etapas da mesma modal,
com ida/volta e botão de avanço integralmente visível em 360px e desktop.
A suíte completa E2E foi executada novamente: 32 testes aprovados; após a divisão
em etapas, a jornada MFA específica foi reexecutada nos dois tamanhos.

## Fluxo reutilizável e animações — complemento de 20/11

`useStepFlow` em `@soe/ui` controla grafo tipado, histórico, transições permitidas,
avanço único, ramificações, retorno e reset, incluindo comandos no mesmo evento.
Expõe também a etapa e a renderização opcional do componente. O MFA agora consome
esse hook em vez de manter flags próprias para alternar conteúdo.

`StepFlowContent` faz a entrada direcional sobre os tokens de página existentes,
inverte o sentido ao voltar, respeita movimento reduzido e desmonta o conteúdo
anterior imediatamente. Não conserva cópias de senha ou QR para animação de saída.
A documentação pública fica no guia de componentes UI.

A revisão de padrões encontrou e corrigiu a prioridade de foco: `data-step-focus`
é procurado antes dos controles, e campos ocultos não recebem foco de fallback.
A prévia pública cobre título marcado depois de um botão e campo visível depois
de um campo oculto. Standards e Spec: nenhum achado pendente.

Verificações adicionais: 24 unitários e 34 testes da suíte completa de navegador
(6 UI, 14 form, 14 web) aprovados. O teste público do hook e a jornada MFA foram
executados em desktop e reduced-motion; o teste do hook foi repetido após a
correção do foco. Build, tipos, lint, arquitetura, formatação e bundle aprovados.
Os 15 testes de integração da API aprovados no ajuste de emissor permanecem como
evidência do backend, que não mudou neste complemento.
