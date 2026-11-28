# QA — diretório escolar, cabeçalho e detalhes do convite

Alterações implementadas e verificações independentes executadas. QA pela
extensão e GIF continuam **BLOQUEADOS/PENDENTES**: Browser/Chrome conectado não
está disponível nesta sessão. Não encerrar a issue com base neste relatório.

Base: `3480c138cae15ae0d67202cabcd2477174b7fb9a`, branch
`feat/staff-invitations`. Trabalho iniciado com árvore limpa em 22/11/2026 UTC
(noite de 21/11 local); execução final na madrugada de 22/11 America/Sao_Paulo.
O usuário ampliou o pedido durante a etapa. Planos publicados antes de cada
ampliação: [detalhes/X](https://github.com/LuisCarlos-git/soe-saas/issues/6#issuecomment-7073204664),
[cabeçalho/tooltips](https://github.com/LuisCarlos-git/soe-saas/issues/6#issuecomment-7073259348)
e [diretório escolar](https://github.com/LuisCarlos-git/soe-saas/issues/6#issuecomment-7073285298).
Fonte e evidências são publicadas juntas; hashes em [manifest.json](manifest.json).

## Comportamento entregue

- Cabeçalho autenticado concentra título e retorno na faixa superior, onde
  ficava o breadcrumb. Ícone de 16 px, alvo de 40 px e gap compacto. Conteúdo
  usa PageToolbar apenas para contexto e ações; não repete título/retorno.
  Configurações mantém a seção atual como contexto da localização. Sidebar
  permanece montada e a transição continua somente no conteúdo.
- Profissionais (seleção de escola) e Minhas escolas usam o mesmo diretório
  tabular: nome, ano/fuso, profissionais ativos, convites pendentes e total.
  Busca, ordenação e paginação são feitas no servidor. Menu por escola leva à
  equipe ou às configurações. Contagens incluem somente o escopo autorizado.
- Novo GET `/api/v1/schools` exige autenticação/MFA pela fronteira existente e
  lista exclusivamente escolas com vínculo ativo de SCHOOL_ADMIN. Operador
  sem vínculo recebe lista vazia. Prisma faz agregação por página, sem uma
  requisição HTTP por escola. Vínculo ativo conta o responsável administrador.
- Convites têm menu Ver detalhes, com destinatário, todos os papéis, situação,
  envio, datas no fuso escolar e estado do vínculo quando aceito. Na tabela,
  no máximo dois papéis com reticências; a modal preserva a lista completa.
- Revisão usa diretamente Confira antes de enviar como título e recebe foco.
  A composição do sucesso foi preservada. X permanece acima do conteúdo
  animado e o clique real no seu centro fecha a modal e devolve foco.
- Suporte das tags sai da linha fixa e aparece em tooltip. Hover/foco abrem
  no desktop; toque fixa no celular até nova interação de fechamento. Envio e
  aceite continuam sendo conceitos distintos.

## Cenários e resultados

| ID         | Observado                                                                                                                                                                                                                                    | Evidência                                                                                                                                                                                                                                                                                                                                                                      |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| QA-006-D01 | APROVADO no complemento: menu por mouse e teclado, detalhes da linha correta, três papéis completos, Escape/X, foco restaurado e Axe sem violações no estado estável.                                                                        | [Detalhes desktop](invitation-details-modal-desktop.png), [mobile](invitation-details-modal-mobile.png), [ações após rolagem](invitation-details-modal-actions-mobile.png), [jornada final](counts-evidence.log)                                                                                                                                                               |
| QA-006-D02 | APROVADO: tabela resume Direção, Professor…; modal mostra também Monitor. Busca, ordenação e páginas continuam funcionando.                                                                                                                  | [Menu desktop](invitation-details-menu-desktop.png), [mobile](invitation-details-menu-mobile.png), [jornada](counts-evidence.log)                                                                                                                                                                                                                                              |
| QA-006-D03 | APROVADO: título da revisão sem repetição, foco no título e editar conserva valores. Sucesso mantém composição aprovada.                                                                                                                     | [Revisão desktop](invitation-dialog-review-desktop.png), [mobile](invitation-dialog-review-mobile.png), [sucesso desktop](invitation-dialog-success-desktop.png), [mobile](invitation-dialog-success-mobile.png)                                                                                                                                                               |
| QA-006-D04 | APROVADO: reprodução vermelha e diagnóstico mostram centro do X recebendo step-flow-content; após z-10, recebe button. Alvo medido 44×44, clique real fecha em desktop e mobile, sem forçar dispatch ou click.                               | [Reprodução](x-red.log), [diagnóstico](x-diagnosis.log), [reteste](counts-evidence.log)                                                                                                                                                                                                                                                                                        |
| QA-006-H01 | APROVADO: URLs, navegação/retorno, configurações, sidebar e movimento no conteúdo. Título no shell e retorno compacto conferidos visualmente.                                                                                                | [12 testes das telas](surface-final.log), [configurações](school-settings-mobile.png), [perfil](settings-profile-desktop.png)                                                                                                                                                                                                                                                  |
| QA-006-H02 | APROVADO: foco no desktop e toque no mobile mostram suporte de Pendente/Ativo; Escape fecha. E-mail enviado conferido pelo percurso com SMTP local real.                                                                                     | [Pendente desktop](invitation-pending-tooltip-desktop.png), [mobile](invitation-pending-tooltip-mobile.png), [Ativo mobile](invitation-active-tooltip-mobile.png), [jornada](counts-evidence.log)                                                                                                                                                                              |
| QA-006-S01 | APROVADO: 401 anônimo, operador sem escolas, isolamento A/B, agregados comparados ao PostgreSQL, duas páginas sem repetição, busca literal e validação de query. Remover vínculo ativo ou papel administrativo retira a escola do diretório. | [17 testes HTTP/PostgreSQL](integration.log)                                                                                                                                                                                                                                                                                                                                   |
| QA-006-S02 | APROVADO: ambas as telas com busca, limpar, ordem, contagem real, vazio recuperável, menu e retorno para escola correta. No celular a região rola por teclado e mostra contagens; Axe no diretório exercitado sem violações.                 | [Profissionais desktop](invitation-school-directory-desktop.png), [mobile](invitation-school-directory-mobile.png), [contagens mobile](invitation-school-directory-counts-mobile.png), [Minhas escolas desktop](invitation-my-schools-directory-desktop.png), [mobile](invitation-my-schools-directory-mobile.png), [vazio](invitation-school-directory-no-results-mobile.png) |

## Execuções e correções

- [Baseline](baseline.log): 4 jornadas de convites aprovadas antes da alteração.
- [Reprodução do X](x-red.log): falha determinística em 4 s de jornada. O
  [diagnóstico](x-diagnosis.log) mostra pointer-events auto e alvo 44×44,
  mas a camada step-flow-content intercepta o centro. Corrigido somente o
  empilhamento do botão, sem alterar a receita de animação.
- [Primeiro teste de detalhes](details-initial.log): 3 aprovados e 1 falhou;
  Axe avaliou o contraste durante entrada da modal/saída do menu. Aguardar as
  animações finitas pelo helper de captura antes da análise resolveu a leitura
  transitória; [4 jornadas passaram](details-final.log).
- [Primeira regressão ampliada](web-initial.log): 23 passaram e 3 falharam.
  O observador de movimento buscava o título antigo dentro do conteúdo; agora
  identifica Visão geral pelo texto que permaneceu nele. Um foco programático
  em coluna fora da viewport mobile fechava o tooltip com a rolagem; o percurso
  mobile passou a exercitar toque, enquanto desktop mantém foco por teclado.
- [Reteste de tooltip](web-tooltip-initial.log): 25 passaram e 1 falhou. O
  tooltip aberto por toque podia desaparecer com eventos de saída. Clique
  agora fixa sua abertura; Escape, blur e clique fora encerram. Sem novos
  timings ou CSS de movimento.
- [Regressão ampla](web-all.log): **26 testes web aprovados**, com o tooltip
  corrigido. Depois, a composição do diretório saiu de Staff para a rota
  consumindo o módulo Schools, para respeitar o isolamento entre módulos.
  [12 testes das telas afetadas](surface-final.log) passaram após esse ajuste,
  sem mudança de DOM. A [última jornada em dois viewports](counts-evidence.log)
  acrescentou a captura das contagens mobile. As colunas numéricas foram
  compactadas para ler profissionais e convites juntos após rolagem; a jornada
  foi repetida em desktop/mobile após esse ajuste, com a versão final.
- [Integração](integration.log): **17 testes** em 3 suítes aprovados;
  [unitários](unit.log): **33 aprovados**. Build de [web](web-build.log) e
  [API/OpenAPI](api-build.log), typechecks [web](web-types.log),
  [API](api-types.log) e [UI](ui-types.log), [lint](lint.log),
  [formatação](format.log), [fronteiras](architecture.log),
  [bundle](bundle.log) e diff sem espaços indevidos aprovados.

Revisão visual independente aprovou desktop e mobile, incluindo título/retorno,
menu, X, confirmação, sucesso e tooltips. A revisão inicial não podia confirmar
as contagens mobile por estarem fora do recorte horizontal; foi acrescentada
captura após rolagem. E-mails podem quebrar a última letra em 768 px, sem perda
de conteúdo; refinamento menor registrado, sem bloqueio funcional.

A revisão independente conferiu a captura final das contagens de 00:24 e os
dois diretórios desktop após compactar as colunas; confirmou os cabeçalhos,
números, total e paginação legíveis, encerrando a pendência visual mobile.

## Referências, ambiente e limites

[Atlassian Page header](https://atlassian.design/components/page-header/usage)
orientou o agrupamento de título, contexto e ações;
[Polaris, retorno no cabeçalho](https://shopify.dev/docs/apps/build/app-home/migrate-from-polaris-react/breadcrumbs)
orientou o retorno junto ao título. A adaptação segue o pedido do usuário e
preserva tokens/identidade SOE. O padrão foi atualizado em DESIGN.md e no guia
de componentes UI. Menus, diálogos e tooltips reutilizam as receitas existentes.

Playwright complementar em `127.0.0.1:43220`, PostgreSQL/Mailpit efêmeros,
identidades example.test e dados sintéticos. Desktop 1280×720, mobile 360×780;
capturas adicionais do conteúdo em 320/768/1024 px. Prints fullPage não provam
ações visíveis sem rolagem; a modal detalhada tem captura de topo e ações.
Nenhum token, QR, cookie, senha ou trace foi publicado. SMTP local não comprova
entrega externa ou leitura humana.

Sem Browser conectado, GIF, leitor de tela, dispositivo físico ou teste manual
de zoom. AbortError/ECONNRESET do harness em navegações também aparece no
baseline; não alegamos console global sem erros. A cobertura acima não certifica
acessibilidade ou segurança de todo o produto e não encerra os gates pendentes.
