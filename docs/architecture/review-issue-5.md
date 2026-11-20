# Issue #5 — Provisionar uma escola piloto

Implementação da fatia 04 do core, sobre a fundação de identidade e MFA das
issues #3 e #4. Escopo e demonstração em [pilot-school.md](../runbooks/pilot-school.md).

## Arquitetura e autorização

`apps/api/src/modules/schools` entrega cinco casos de uso puros: descobrir acesso,
listar escolas para operador, provisionar escola, ler configurações e atualizar
configurações. Controllers validam contratos e compõem identidade; infraestrutura
Prisma implementa a unidade de trabalho. A composição Nest fica no módulo.

O operador é uma autoridade global persistida distinta do vínculo escolar.
Provisionamento exige operador ativo e sessão MFA verificada. Criação da escola,
vínculo inicial `SCHOOL_ADMIN` e auditoria compartilham uma transação serializável.
Leitura/escrita escolares filtram simultaneamente ID da organização, identidade,
papel e vínculo ativo. Configurações usam versão para recusar sobrescrita
concorrente. A autoridade do operador não participa desse filtro escolar.

Somente identidade, sessão e autoridade operacional são globais. Configuração,
vínculo e auditoria escolar pertencem à organização. Não há agregação por
mantenedora, concessão restrita automática, cobrança ou habilitação de dados reais.

## Interface

Aba Escolas estende as Configurações existentes e aparece conforme acesso.
Operador vê metadados administrativos paginados e o cadastro em modal com foco
protegido; responsável vê suas escolas e formulário de configuração. As URLs
suportam acesso direto e reload. Alterações não salvas pedem confirmação ao sair;
fechamento da modal durante envio fica bloqueado. Falha da API preserva os campos,
com feedback no Sonner global. Conflito permite recarregar explicitamente.

Foram consultadas as skills ui-ux-pro-max, frontend-design,
frontend-ui-engineering, interface-design e impeccable. A consulta local de
ui-ux-pro-max para formulários React confirmou labels persistentes. A orientação
Taste foi limitada à superfície operacional, conforme o PRD. A identidade,
tokens, sidebar e tab bar seguem DESIGN.md. Não há nova identidade ou ilustração.

Movimento reutiliza a receita Modal (06) de Transitions.dev nas primitivas
existentes e a entrada de conteúdo já aprovada: sidebar, cabeçalho e tabs
permanecem estáveis. `prefers-reduced-motion` permanece atendido pelos estilos
compartilhados. Nenhum fix hospedado do transitions-agent foi executado.

## Evidência comportamental

`schools.test.mjs` exercita a composição HTTP/Nest com migrations e PostgreSQL
efêmero: operador/MFA, duas escolas, responsáveis distintos, leitura e escrita
com IDs trocados, campo extra, fuso/ano inválidos, responsável inexistente, CSRF,
edição concorrente, versão antiga, falha de auditoria com rollback e revogação.
Consulta SQL serve apenas à verificação técnica de auditoria e revogação; a
observação dos efeitos escolares ocorre pela API pública.

`schools.spec.ts` percorre web/API/banco reais em desktop e 360 px com movimento
reduzido: acesso pela tab, exigência de MFA, validação, foco de abertura/retorno,
cadastro e reload, configuração pelo responsável, aviso de alterações não salvas,
persistência, negação de escola não vinculada e axe nas superfícies entregues.
MFA é preparado pelo HTTP nesta jornada; a jornada própria de MFA continua
validando a inscrição e o QR pela interface. O gerador RFC 6238 dos testes é
independente do provedor e compartilhado em `scripts/test-totp.mjs`.

Capturas locais: `test-results/school-create-{desktop,mobile}.png`,
`schools-{desktop,mobile}.png` e `school-settings-{desktop,mobile}.png`.
Elas usam somente identidades e escolas sintéticas e não são publicadas no PR.

## Revisão

Revisão paralela de Spec não encontrou lacunas na fatia sintética. Standards
solicitou uma intenção por caso de uso; o agrupamento inicial foi separado.
Também foram separados o diálogo de criação e a listagem, e centralizado o
helper de TOTP dos testes. A demonstração não declara prontidão operacional
para dados reais nem gestão geral de operadores/convites.

## Checks executados em 20/11/2026

- `pnpm build`, `pnpm lint`, `pnpm typecheck` e `pnpm format:check`: passaram.
- `pnpm architecture:check`: passou, incluindo fixtures negativas de fronteira.
- `pnpm test:unit`: 24 testes passaram.
- `pnpm test:integration`: 16 testes em quatro suítes passaram, com PostgreSQL
  efêmero e migrations reais.
- `pnpm test:e2e`: 40 testes passaram: seis de UI, 14 de formulário e 20 web,
  nas duas configurações de viewport. O novo fluxo inclui perda de rede e
  recuperação, edição desatualizada, reload explícito e persistência.
- `pnpm bundle:check`: passou; sem pacote exclusivo do servidor, credencial
  ou endereço de upstream no cliente.
- Detector Impeccable executado uma vez nos alvos de UI alterados: `[]`.
- Migration aditiva aplicada no banco local e seed sintético executado.
  Smoke local: `/health/ready` e `/settings/schools` responderam HTTP 200.

As capturas verificadas mostram o topo da modal rolável, lista de escolas e
configurações carregadas em 1280 px e 360 px. Nenhum resultado é uma certificação
global de segurança ou acessibilidade, nem substitui os gates do piloto real.

Revisão visual independente: `ship` nas seis capturas e superfícies de escolas,
sem correções materiais. Foi usado um agente padrão em contexto novo como
substituto do revisor nomeado Impeccable, indisponível neste harness. DESIGN.md
e seus artefatos foram preservados.
