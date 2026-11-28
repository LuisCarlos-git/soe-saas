# QA complementar — layout dos convites

Execução: 22/11/2026. Base `1cfad2e85dda0b7a9986ee48e0d14cbbd64c3a58`.
Fonte final `d0c766bde7610297426b4e209c7e79af46453906`.
Plano: https://github.com/LuisCarlos-git/soe-saas/issues/6#issuecomment-7079717820.
Método: Playwright com aplicação/API/PostgreSQL/SMTP de teste reais e dados
sintéticos. [Manifesto de hashes](manifest.json).

## Resultado visual

- Nome e avatar mantêm o agrupamento; e-mail passa a ocupar a largura inteira
  abaixo deles. Quebra natural, com `overflow-wrap: anywhere` para segmentos
  longos, substitui a quebra arbitrária de qualquer caractere.
- Títulos de modais usam 20 px no celular e 24 px em telas maiores. O botão
  fechar mantém alvo de 44 px e prioridade de clique sobre o conteúdo animado.
- Sucesso separa mensagem, destinatário e próximos passos. Detalhes usam duas
  colunas, com data e hora em linhas explícitas, sem cortar seus valores.
- Cadastro/login/aceite mostram o e-mail completo no cabeçalho, papéis em tags e
  validade agrupada. Inputs de linha única continuam com rolagem nativa para
  valores longos, sem truncar o dado persistido.
- Em 320 px, ações da revisão ficam empilhadas; a partir de 360 px, lado a lado.

As capturas `before-*` representam a base. As `after-*` usam um e-mail sintético
mais longo para estressar o layout; os dados e horários diferem deliberadamente.
Todas as capturas publicadas foram abertas e inspecionadas. Imagens fullPage de
modal mostram o documento ao fundo além da viewport; não comprovam sozinhas que
as ações cabem. As capturas `width-*` são de viewport, e o teste também verifica
o alcance e o fechamento das ações.

## Falha e reteste

O primeiro passe comportamental passou, mas a inspeção visual revelou rótulos
cortados em 320 px. Preservado em
[captura intermediária](intermediate-clipped-actions-320.png).
Uma asserção inicial de scrollWidth do rótulo não detectava o recorte pelo
contêiner pai; foi reforçada para comparar as duas caixas reais.

O teste reforçado falhou contra a compilação anterior, que ainda tinha duas
colunas: [reprodução, exit 1](actions-clipping-red.log).
Após reconstruir a regra responsiva, os quatro testes passaram:
[reteste, exit 0](browser-final.log). A mesma asserção verifica rótulos inteiros,
além de ausência de overflow na página e na superfície, em 320 e 768 px.

## Checks executados nesta etapa

| Comando                                                        | Resultado          | Evidência                    |
| -------------------------------------------------------------- | ------------------ | ---------------------------- |
| `pnpm --filter @soe/web build`                                 | exit 0             | [log](build.log)             |
| `pnpm exec playwright test apps/web/tests/invitations.spec.ts` | 4 passaram, exit 0 | [log](browser-final.log)     |
| `pnpm --filter @soe/web typecheck`                             | exit 0             | [log](types.log)             |
| ESLint nos arquivos alterados, sem warnings                    | exit 0             | [log](lint.log)              |
| `pnpm architecture:check`                                      | exit 0             | [log](architecture.log)      |
| `pnpm bundle:check`                                            | exit 0             | [log](bundle.log)            |
| Prettier nos arquivos alterados                                | exit 0             | [log](format.log)            |
| Detector visual                                                | zero achados       | [JSON](design-detector.json) |

Jornadas incluem convite inválido, acesso sem permissão, revisão/edição/envio
único, fechamento/foco, envio SMTP, cadastro, login de conta existente, conta
errada, MFA administrativo e aceite isolado por escola. Axe está integrado à
jornada. Viewports de composição: 1280 e 360 px, com capturas extras em 320 e
768 px para revisão, sucesso, detalhes, cadastro, confirmação e login.

Os 32 testes API/PostgreSQL, 34 unitários, 14 de formulário e 6 de UI da etapa
anterior continuam documentados no [relatório anterior](../2026-11-22-pr-review/report.md),
com seu próprio commit. Não foram reexecutados nesta fatia exclusivamente visual.

## Revisões independentes

Standards: 1 apontamento menor corrigido (`p-5` substituído por `p-4`, conforme
escala aprovada), 0 pendências e 0 heurísticas relevantes. Spec: 0 divergências;
mantidos revisão, papéis, permissões, MFA, fechamento e distinção envio/aceite.
A ressalva sobre captura de 320 px antiga foi resolvida reconstruindo e
recapturando os estados finais.

## Capturas

| Superfície      | Desktop                                      | Celular                                                                                   |
| --------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Revisão         | [depois](after-dialog-review-desktop.png)    | [antes](before-dialog-review-mobile.png) · [depois](after-dialog-review-mobile.png)       |
| Sucesso         | [depois](after-dialog-success-desktop.png)   | [antes](before-dialog-success-mobile.png) · [depois](after-dialog-success-mobile.png)     |
| Detalhes        | [depois](after-details-modal-desktop.png)    | [antes](before-details-modal-mobile.png) · [depois](after-details-modal-mobile.png)       |
| Cadastro        | [depois](after-register-desktop.png)         | [antes](before-register-mobile.png) · [depois](after-register-mobile.png)                 |
| Aceite          | [depois](after-confirm-desktop.png)          | [antes](before-confirm-mobile.png) · [depois](after-confirm-mobile.png)                   |
| Login existente | [depois](after-existing-sign-in-desktop.png) | [antes](before-existing-sign-in-mobile.png) · [depois](after-existing-sign-in-mobile.png) |

## Gate

Extensão Chrome e GIFs solicitados continuam indisponíveis: **PENDENTE**.
Estas capturas e testes são complementares, não substituem esse gate.
Preservar PR 46 em rascunho e issue 6 aberta; nenhum merge executado.
