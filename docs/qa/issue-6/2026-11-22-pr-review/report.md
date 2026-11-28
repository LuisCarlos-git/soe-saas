# QA complementar — preparação do PR

Execução em 22/11/2026, branch `feat/staff-invitations`.
Base do PR: `d86641918c57f1725e6a753176b314e040c9a6e7`.
Fonte final: `4c71d123160f55bbb73cc80cbd7a04eeca6f87cb`.
Plano: https://github.com/LuisCarlos-git/soe-saas/issues/6#issuecomment-7079505641.
Arquivos e hashes: [manifest.json](manifest.json).

## Mudanças e cenários

- Antes, botão padrão media 50 px e input 44 px. Após reduzir padding vertical
  do botão, ambos medem 44 px em desktop e celular; loading mantém dimensões.
  O teste existente verifica dimensões, estados, foco, erro e acessibilidade.
- Busca por nome/e-mail saiu da URL da API para corpo POST. As leituras GET
  rejeitam `search`. Validar buscas vazias, termos sem resultado, caracteres
  `%`/`_`, paginação, ordenação, escola alheia e usuário sem autenticação.
- Transporte mantém credencial SSR, valida resposta e propaga cancelamento.
  Formulários de busca usam POST também no fallback anterior à hidratação.
- Diretrizes e regras persistidas em AGENTS.md e DESIGN.md: descoberta de skills,
  revisão antes do PR e atualização de issues após merge confirmado.

## Checks executados

| Check                                         | Resultado                    | Evidência                                            |
| --------------------------------------------- | ---------------------------- | ---------------------------------------------------- |
| Build UI                                      | passou, exit 0               | controles renderizados abaixo                        |
| Browser UI                                    | 6 passaram, exit 0           | `packages/ui/tests/browser.spec.ts`, capturas abaixo |
| Build web final                               | passou, exit 0               | [log](web-build.log)                                 |
| API/PostgreSQL final                          | 32 testes, 6 suites passaram | [log](integration.log)                               |
| Unitários finais                              | 34 passaram                  | [log](unit.log)                                      |
| Formulários browser                           | 14 passaram                  | [log](form-browser.log)                              |
| Web completo antes da correção de privacidade | 26 passaram                  | [log](web-full-before-privacy-fix.log)               |
| Jornadas afetadas após a correção             | 12 passaram                  | [log](web-final.log)                                 |
| Lint, tipos, arquitetura, bundle e formato    | passaram, exit 0             | logs nomeados neste diretório                        |
| Detector visual mecânico                      | sem achados                  | [JSON](design-detector.json)                         |

O teste novo de transporte inicialmente falhou porque sua fixture continha
campos extras rejeitados pelos schemas strict; foi corrigida para responder
o schema correspondente à lista. Typecheck também identificou o campo opcional
da captura de RequestInit; a fixture foi tipada com `undefined` explícito.
São correções de teste, seguidas pelos resultados finais registrados acima.

Capturas complementares de Playwright, revisadas visualmente:
[desktop](controls-desktop.png) e [celular](controls-mobile.png).
Dados sintéticos; nenhum token, cookie, QR ou link de convite nas capturas.
Relatórios anteriores preservam o antes/depois do diretório e das tabelas.

## Gate

**PENDENTE: extensão Chrome e GIFs indisponíveis nesta sessão.** Playwright não
substitui o QA nativo solicitado. Sem exceção autorizada, publicar somente PR
em rascunho, manter issue e critérios pendentes. Nenhum merge foi executado.
Revisões independentes: [Standards e Spec](../../../architecture/review-issue-6.md).
