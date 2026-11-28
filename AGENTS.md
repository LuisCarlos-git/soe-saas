<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": true` in the root `turbo.json` or `turbo.jsonc` to opt in; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->

## Product requirements

Antes de planejar, implementar ou revisar funcionalidades, arquitetura, segurança
ou interface do SOE, leia `docs/PRD.md` (PRD 1.3). As seções 6 e 7 contêm
regras obrigatórias; a seção 16 orienta a implementação das ferramentas backend.
Preserve a distinção entre decisões confirmadas, propostas e perguntas abertas.

## Design aprovado

Antes de criar, alterar ou revisar interfaces, leia `DESIGN.md`: é a base visual
aprovada do SOE, com tokens, componentes, estados e referência do login. Aplique
a identidade às novas telas e adapte a composição à tarefa de cada superfície.
Componentes genéricos partem do shadcn/ui em `@soe/ui`. Nesse pacote, use `cn()`
para classes condicionais e imports sem extensão; consulte
`docs/architecture/ui-components.md` antes de ampliar o catálogo ou suas transições.

## Formulários

Todos os componentes consumidos pelos formulários vêm de `@soe/form`, incluindo
checkbox, textarea, seleção e envio. Antes de criar ou alterar campos, leia
[`packages/form/README.md`](packages/form/README.md): use AppField/AppForm e adicione
novos adapters ao pacote antes do uso. As primitivas shadcn de `@soe/ui` são a base
interna; lint e checagens arquiteturais verificam a origem dos controles no web.

## Agent skills

### Descoberta de skills

Sempre use `find-skills` ao precisar de uma capacidade específica, integração,
biblioteca ou técnica. Consulte primeiro as skills disponíveis; se nenhuma
atender, siga a busca e verificação de qualidade da skill antes de recomendar
ou instalar uma opção.

Para decisões de interface, aplique as cinco skills: `ui-ux-pro-max`,
`frontend-design`, `frontend-ui-engineering`, `interface-design` e `impeccable`.
`DESIGN.md` é a fonte das diretrizes aprovadas.

### Revisão obrigatória antes do PR

Sempre execute `code-review` antes de abrir qualquer PR. Fixe o SHA da base do
PR, revise Standards e Spec com agentes independentes e corrija os achados
relevantes. Registre resultados e pendências separadamente por eixo.

### Issues após merge

Após cada merge confirmado, atualize as issues relacionadas no GitHub com o
PR, o commit integrado, a entrega e suas evidências. Atualize os critérios
comprovados e o acompanhamento na issue pai quando aplicável. Preserve
critérios pendentes; encerre a issue somente quando todo o escopo estiver
concluído e validado. Abrir um PR não equivale a concluir ou integrar a entrega.

### QA obrigatório por etapa

Antes de implementar cada etapa e antes de avançar, abrir PR ou concluir uma
entrega, leia e aplique
[qa-browser-evidence](.agents/skills/qa-browser-evidence/SKILL.md).
Planeje cenários a partir do PRD/spec, execute QA de UI/API com exploração de
ações reais inesperadas e publique resultados, prints e GIFs sanitizados nas
issues do GitHub. Use a extensão Chrome solicitada pelo usuário; indisponibilidade
de conexão/captura deve ficar registrada como bloqueio, sem declarar o QA aprovado.
Uma etapa é uma fatia de implementação ou marco de entrega, não cada comando.

### Issue tracker

Issues e specs ficam no GitHub, em LuisCarlos-git/soe-saas.
Antes de operar tickets, leia `docs/agents/issue-tracker.md`.

### Triage labels

Usamos as cinco labels padrão de triagem.
Antes de classificar tickets, leia `docs/agents/triage-labels.md`.

### Domain docs

Layout single-context. Antes de explorar o domínio,
leia `docs/agents/domain.md`.

## Arquitetura atual

Antes de alterar backend, testes, persistência ou fronteiras, leia
`docs/adr/0003-api-local-backend.md`. A decisão aprovada substitui os mapas
antigos do PRD: backend exclusivo em `apps/api`; packages apenas independentes
ou compartilháveis. Domain/repositories/use-cases são puros; factories compõem
adapters. Para erros da API no web, usar o Toaster Sonner global com richColors.
