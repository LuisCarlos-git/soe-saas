# Entrega da issue #3 — Entrar e encerrar sessão

## Verificação final — 17/11/2026

Os sete critérios da issue #3 foram confrontados com a implementação atual e as evidências abaixo. A compatibilidade e a autoridade da sessão estão em ADR 0002; persistência, cookies, CSRF, revogação, respostas seguras, auditoria transacional e rate limiting compartilhado são exercitados por HTTP real em `apps/api/tests/identity.test.mjs`. A jornada `apps/web/tests/identity.spec.ts` verifica entrada, duas sessões SSR independentes e saída. As fronteiras seguem ADR 0003.

O login agora consome `@soe/form`: schemas e composição pertencem ao módulo identity; conexão de campos, validação acessível e envio assíncrono são verificados pela interface pública do pacote. O cliente HTTP normaliza JSON inválido, corpo vazio e respostas incompatíveis em `ApiError` seguro com uma única notificação, preservando cancelamentos.

Checks executados nesta revisão:

- `pnpm test:unit`: 24 testes aprovados.
- `pnpm test:integration`: 14 testes aprovados com PostgreSQL temporário e migrations reais. A primeira execução falhou ao resolver `dist/app.js`; a repetição integral passou. A causa da indisponibilidade transitória do artefato não foi confirmada.
- `pnpm --filter @soe/form test:browser`: 14 testes aprovados; `pnpm --filter @soe/ui test:browser`: 4 aprovados.
- Jornadas web: 12 aprovadas em desktop e celular. Como os servidores de desenvolvimento ocupavam 43120/43121, um harness temporário em `/private/tmp/soe-packages-e2e-1794748293009` executou os mesmos testes e bundles reais em 45120/45121, com PostgreSQL descartável e encaminhamento interno ajustado somente no processo de teste. O harness é local e não integra o repositório; o CI usa a configuração padrão.
- `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm architecture:check` e `pnpm bundle:check`: aprovados.

O primeiro CI remoto identificou uma fixture negativa que dependia do build de `@soe/ui`, ausente nessa etapa do checkout limpo. A fixture passou a importar diretamente o fonte proibido; os imports públicos continuam cobertos pelas fixtures ESLint. Não há lacuna funcional identificada no recorte da issue #3. Permanecem pendentes a repetição do CI remoto, a revisão e o merge do PR. Implantação pública e dados reais continuam fora desta entrega.

Base de revisão confirmada: `d5e1645`. Recorte aprovado: e-mail/senha, erros seguros, identificação mínima e saída. Cadastro público e recuperação de senha ficam fora desta fatia; MFA é #4 e escola ativa é #5.

## Decisões visuais e referências

Consultadas as skills globais ui-ux-pro-max, frontend-design, frontend-ui-engineering, interface-design e Impeccable 4.8.2, além de Taste 2.5.1. Aplicação operacional: conservar a paleta verde aprovada, tokens Tailwind, fonte de sistema, campos de 16 px, labels persistentes e ações de pelo menos 44 px. Sem ilustrações ou animações nesta fatia, conforme recorte confirmado; não há nova adoção de Hairline nem receita Transitions a validar. Os demais guias não impõem decoração de landing page ao login.

Componentes alterados: LoginPage e AccountPage no módulo identity, rotas finas `/login` e `/account`, integração do cliente por requisição. Reutiliza Button do pacote ui, sem conceitos de identidade no design system. Erros de credenciais, envio em andamento, falha de conexão e falha da consulta de sessão recebem texto; acesso ausente redireciona ao login. Navegação só ocorre após confirmação do servidor; senhas não são persistidas.

Revisão real em Chromium desktop e 360 px com reduced-motion: sem overflow, labels e foco visível, alvos de toque e zero violações Axe nas telas de login e identificação. Capturas locais: `test-results/login-{desktop,mobile}.png` e `test-results/account-{desktop,mobile}.png` (artefatos ignorados pelo Git, somente dados sintéticos). Foram inspecionadas visualmente as capturas móveis. Nenhum script de auditoria Taste/Impeccable é declarado como executado nesta entrega; revisão por browser/Playwright e inspeção visual.

## Cobertura comportamental

HTTP real com PostgreSQL temporário: sessão ausente 401; entrada 204 com cookie HttpOnly/SameSite; identificação só com id/nome/e-mail; logout e replay do cookie revogado 401; origem indevida/ausente 403; cadastro público 404; conta inexistente e senha incorreta com resposta equivalente; limite compartilhado por duas APIs com cabeçalhos de IP falsos ignorados e recuperação após janela; cookie Secure e boot seguro em produção; logs sem credenciais; OpenAPI coerente.

Browser: entrada inválida/válida, duas identidades em contextos independentes, requisições SSR simultâneas sem troca de dados, no-store, ausência de cookie legível/localStorage/sessionStorage, saída seguida de acesso bloqueado e segunda sessão ainda válida. Preserva as jornadas e integrações sintéticas da issue #2.

## Limites operacionais

Os processos continuam locais conforme bootstrap. Rate limiting agrega tráfego no IP do socket da borda; configuração de outra topologia exige teste de confiança do proxy. Não há contas na migração nem endpoint de seed: fixtures só no banco temporário. A auditoria é persistida por trigger na mesma transação da sessão. Dados reais, implantação pública, MFA e permissões escolares permanecem dependentes das entregas e validações próprias. Ver [compatibilidade](backend-tooling.md), [ADR](../adr/0002-backend-session-authority.md) e [runbook](../runbooks/authentication.md).

## Checks executados

- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`: aprovados.
- `pnpm architecture:check`: aprovado, incluindo três fixtures negativas rejeitadas.
- `pnpm build` e `pnpm bundle:check`: aprovados; após a organização final do módulo, build da API e do web repetidos e aprovados.
- `pnpm test:unit`: 1 teste aprovado.
- `pnpm test:integration`: 13 testes aprovados, PostgreSQL temporário com migrations reais.
- `pnpm test:e2e`: 4 jornadas aprovadas (diagnóstico e autenticação em desktop/celular). Após acrescentar falhas de conexão à jornada de autenticação, o arquivo específico passou novamente nos dois projetos.
- `git diff --check`: aprovado.

A expectativa antiga de OpenAPI foi ajustada para permitir o campo de entrada `password` no contrato de login, mantendo os schemas de saúde sem campos pessoais/credenciais. A verificação do cookie Secure considera os atributos reais do provedor; valores de credenciais não são gravados em artefatos versionados. Esses resultados são locais; não representam execução do CI remoto.

## Revisão independente

A skill code-review foi executada com dois agentes em contextos novos, ambos somente de leitura, sobre `git diff d5e1645...a154f84`.

- Standards: nenhum achado acionável de violação documentada ou smell relevante.
- Spec: nenhum requisito ausente/parcial, escopo adicional ou defeito confirmado no recorte aprovado.

Os revisores inspecionaram o código e a evidência; não repetiram os testes. A limitação do ingress local foi mantida explícita e não foi tratada como autorização para outra topologia ou dados reais.
