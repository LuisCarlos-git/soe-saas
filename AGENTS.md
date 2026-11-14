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

## Agent skills

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
