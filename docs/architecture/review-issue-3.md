# Entrega da issue #3 — Entrar e encerrar sessão

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
