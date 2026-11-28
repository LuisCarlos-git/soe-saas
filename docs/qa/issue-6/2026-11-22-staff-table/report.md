# QA — tabela da equipe e padrão de cabeçalhos

Implementação e regressão automatizada aprovadas neste recorte. O gate de QA
pela extensão continua **BLOQUEADO**, pois Browser/Chrome conectado não está
exposto nesta sessão; GIF não foi produzido. Não encerrar a issue #6 por este
relatório.

Plano publicado antes das alterações: [comentário na issue #6](https://github.com/LuisCarlos-git/soe-saas/issues/6#issuecomment-7072973412).
Base `c525650362cd3a6c7579420231c9bf6a9e34d842`, branch `feat/staff-invitations`.
Data 22/11/2026 UTC, noite de 21/11 em America/Sao_Paulo. Fonte e evidências são
publicadas juntas; [manifest.json](manifest.json) identifica os bytes testados.

## Resultado

- Tabela com busca global por nome/e-mail, filtro de situação do convite,
  ordenação por profissional ou data e páginas de 10 registros. API filtra e
  ordena antes de paginar; total e desempate por ID são estáveis.
- Tags Pendente, Ativo, Inativo, Expirado e Revogado. Ativo requer convite
  aceito **e vínculo ativo na escola**; o envio do e-mail tem indicação separada.
  A tabela acompanha convites e seus vínculos, sem prometer um diretório de
  profissionais cadastrados por outros meios.
- Um único título Convites da equipe, com voltar ao lado e refresh somente
  ícone junto de Convidar profissional. Padrão `PageHeader` também aplicado em
  Escolas piloto, Minhas escolas, configurações da escola, Configurações,
  seleção de escola para profissionais e Visão geral. A ampliação dos
  cabeçalhos foi solicitada pelo usuário durante esta etapa.
- Papéis do convite com densidade compacta de 36 px e label clicável. Revisão
  separa destinatário, tags de papéis e aviso de acesso; sucesso apresenta
  destinatário e próximos passos. Criação não afirma entrega ou aceite.
- Padrão registrado em DESIGN.md e catálogo UI para próximas telas. Estilos
  dos adapters form agora entram no `@source` do Tailwind consumidor.

## Cenários executados

| ID         | Resultado observado                                                                                                                                                                                                                                           | Evidência                                                                                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| QA-006-T01 | APROVADO: HTTP com 23 convites, busca por nome/e-mail sem diferenciar maiúsculas, caracteres `%` e `_` literais, validação de limites. UI busca um item da primeira página estando na segunda e volta à página 1.                                             | [Integração](integration-final.log), [web](web-final.log)                                                                                                                                     |
| QA-006-T02 | APROVADO: 3 páginas HTTP sem repetição; asc/desc e total corretos. UI com 13 registros, página 2, busca vazia, limpar e filtro Aceitos.                                                                                                                       | [Página 2 desktop](invitation-table-page-2-desktop.png), [mobile](invitation-table-page-2-mobile.png), [sem resultado](invitation-table-no-results-mobile.png)                                |
| QA-006-T03 | APROVADO: pendente/expirado/revogado e vínculo ativo/inativo conferidos por HTTP/PostgreSQL; acesso do admin desativado recusado. UI mostra Ativo após aceite real. Fixtures controladas de banco preparam expiração/desativação, não simulam respostas HTTP. | [Integração](integration-final.log), [Ativo após rolagem](invitation-table-active-right-mobile.png)                                                                                           |
| QA-006-T04 | APROVADO no complemento Playwright: busca/ordenação/paginação e região com foco; ArrowRight muda scrollLeft em 360 px, sem overflow da página. Capturas em 320, 360, 768, 1024 e 1280 px. Axe sem violações na tabela e estados de convite exercitados.       | [320](invitation-table-width-320-desktop.png), [768](invitation-table-width-768-desktop.png), [1024](invitation-table-width-1024-desktop.png), [desktop](invitation-table-sorted-desktop.png) |
| QA-006-T05 | APROVADO: erro local, checkbox por teclado, cancelar descarte mantém dados, revisar/editar preserva valores, envio único, sucesso, saída e retorno de foco.                                                                                                   | Capturas dos três estados abaixo; [web](web-final.log)                                                                                                                                        |
| QA-006-T06 | APROVADO: admin de outra escola recebe 404 ao buscar/ordenar; coleção escolar não mistura registros. UI sem permissão e troca explícita entre duas escolas preservadas. Aceite real via Mailpit, uso único e vínculo independente continuam passando.         | [Integração](integration-final.log), [web](web-final.log)                                                                                                                                     |

## Capturas revisadas

| Superfície               | Desktop                                          | Mobile                                          |
| ------------------------ | ------------------------------------------------ | ----------------------------------------------- |
| Dados e papéis compactos | [Print](invitation-dialog-details-desktop.png)   | [Print](invitation-dialog-details-mobile.png)   |
| Revisar convite          | [Print](invitation-dialog-review-desktop.png)    | [Print](invitation-dialog-review-mobile.png)    |
| Sucesso                  | [Print](invitation-dialog-success-desktop.png)   | [Print](invitation-dialog-success-mobile.png)   |
| Busca sem resultados     | [Print](invitation-table-no-results-desktop.png) | [Print](invitation-table-no-results-mobile.png) |
| Escolas                  | [Print](schools-desktop.png)                     | [Print](schools-mobile.png)                     |
| Configurações da escola  | [Print](school-settings-desktop.png)             | [Print](school-settings-mobile.png)             |
| Configurações pessoais   | [Print](settings-profile-desktop.png)            | [Print](settings-profile-mobile.png)            |

21 PNGs com conteúdo sintético, abertos pelo agente principal. Revisão visual
independente aprovou o recorte: filtros tablet, cabeçalhos, ícones, densidade,
revisão e sucesso. Um corte em Enviar convite mobile foi encontrado na versão
anterior; a captura final das 23:46 mostra o rótulo completo. A revisão
independente confirmou a correção e a legibilidade da tag Ativo após rolagem.
Prints fullPage podem exceder a altura da viewport; tabelas estreitas exigem
rolagem horizontal contida, exercitada separadamente por teclado.

## Checks e retestes

- Baseline: [4 testes web aprovados](baseline.log).
- Final: [26 testes web](web-final.log), [15 HTTP/PostgreSQL](integration-final.log),
  [14 de formulários no navegador](form-browser.log) e [33 unitários](unit.log),
  todos aprovados.
- [Build web](web-build.log), [build API/OpenAPI](api-build.log), typechecks de
  [web](web-types.log), [API](api-types.log), [UI](ui-types.log) e
  [form](form-types.log), [lint](lint.log), [formatação](format.log),
  [fronteiras](architecture.log), [bundle](bundle.log) e `git diff --check`
  passaram. Logs vazios de lint significam processo concluído com exit 0.
- [Primeiro web](web-initial.log): 24 passaram e 2 falharam; status ausente foi
  serializado como `undefined`, causando 400 na busca. Corrigida a omissão do
  parâmetro e comprovada recuperação na regressão final.
- [Primeira integração](integration-initial.log): 14 passaram e 1 falhou; a
  fixture de expiração violava expiresAt maior que createdAt. Corrigida a
  preparação dos dois instantes; integração final com 15 aprovados.
- Revisão visual detectou ícones escondidos pelo padding padrão: botões agora
  usam área de 44 px com padding zero. Corte da ação mobile corrigido ocultando
  apenas o ícone decorativo naquele tamanho; texto e ação permanecem completos.
- [Reteste intermediário](mail-wait-retest.log): 3 passaram e 1 falhou porque a
  espera padrão de 5 s não cobria a fila após 12 convites adicionais. Espera
  explícita de até 15 s pelo e-mail real, sem mocks; regressão final passou.

## Referências e limites

Referências consultadas: [Carbon, toolbar e ordenação](https://carbondesignsystem.com/components/data-table/usage/),
[GOV.UK, revisão de respostas](https://design-system.service.gov.uk/patterns/check-answers/)
e [confirmação com próximo passo](https://design-system.service.gov.uk/patterns/confirmation-pages/).
Adaptação ao SOE: resumo de destinatário/papéis e resultado explícito, preservando
tokens e linguagem aprovados. TanStack Table 8.21.3 com paginação/ordenação
manuais conforme [documentação v8](https://tanstack.com/table/v8/docs/guide/pagination).
find-skills consultou o catálogo; as skills pertinentes já estavam instaladas.

Ambiente Playwright complementar em `127.0.0.1:43220`, PostgreSQL e Mailpit
efêmeros. Somente escolas e identidades example.test. Não foram publicados
QR, senha, token, cookie, fragmento de convite ou trace. Receber no SMTP local
não demonstra entrega externa ou leitura humana.

Sem extensão conectada/GIF, leitor de tela, dispositivo físico ou zoom manual.
O harness registra AbortError/ECONNRESET de requisições abortadas em navegação,
também observados no baseline; não foi comprovado console global sem erros.
O gate Taste instalado ainda aponta para outra superfície (`43130/login`):
retornou 21 findings de regras de landing page e falha de inicialização do
Chrome, não uma avaliação desta tabela. Não alteramos o login aprovado para
satisfazer regras de hero/campanha. A avaliação visual desta etapa usa as
capturas reais e a revisão independente descritas acima, sem declarar o
scanner nem o gate da extensão aprovados.
