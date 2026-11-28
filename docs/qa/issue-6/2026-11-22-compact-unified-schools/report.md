# QA — linhas compactas e lista escolar única

Base: `5e7bf5a1bb91d17fdb40d3b3990010c9976ad01b`. Planos:
[compactar](https://github.com/LuisCarlos-git/soe-saas/issues/6#issuecomment-7073598423)
e [unificar](https://github.com/LuisCarlos-git/soe-saas/issues/6#issuecomment-7073620910).
Execução em 22/11/2026; branch feat/staff-invitations. Fonte e evidências
publicadas juntas, identificadas por hashes em [manifest.json](manifest.json).

## Resultado

Minhas escolas em `/schools` concentra a seleção de escola, contagens e ações.
O item Profissionais foi removido da sidebar; a seleção permanece ativa nos
detalhes da escola e equipe. Nome abre configurações, contagem de profissionais
abre a equipe e o menu oferece ambos. O endereço antigo `/schools/professionals`
redireciona com replace para a lista única, mantendo o bloqueio sem permissão.
Voltar da equipe aponta para `/schools`.

As linhas das duas tabelas foram compactadas com padding vertical de 4 px por
lado, menos espaço entre textos e alinhamento central. Menus/status preservam
alvos de 44 px; o nome da escola tem alvo mínimo de 24 px. Conteúdo longo pode
aumentar a altura, sem corte forçado. Design e runbook foram atualizados.

| Linha regular | Antes, desktop | Depois, desktop e 360 px |
| ------------- | -------------- | ------------------------ |
| Escola        | 96,5 px        | 52,5 px                  |
| Convite       | 76,5 px        | 52,5 px                  |

Medidas reais por getBoundingClientRect e computedStyle na jornada existente,
sem teste novo que espelhe classes CSS. Baseline executado sobre a UI do SHA
base, com instrumentação de medidas no teste; nenhum layout havia sido alterado.
[Baseline](baseline.log) e [execução final](e2e-final.log) contêm os valores.

## Cenários

| Cenário    | Resultado                                                                                                                                                                                 |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| QA-006-R01 | APROVADO no complemento Playwright: alturas reduzidas em desktop/mobile, nomes, contagens, menus, tooltip, rolagem e foco preservados. Revisão visual independente sem problema material. |
| QA-006-R02 | APROVADO: busca, ordem, páginas, convite/aceite, modal e retorno de foco continuam funcionando.                                                                                           |
| QA-006-U01 | APROVADO: sidebar sem item Profissionais duplicado, lista única, alias redireciona, atalhos abrem equipe/configuração da escola correta e retorno leva à seleção.                         |
| QA-006-U02 | APROVADO: usuário sem permissão continua sem menu/acesso escolar; legado não contorna a proteção. Axe nas superfícies exercitadas sem violações na execução final.                        |

12 testes existentes das telas afetadas aprovados, em desktop 1280×720 e mobile
360×780. [Build](build.log), [tipos](types.log), [lint](lint.log),
[formatação](format.log), [fronteiras](architecture.log), [bundle](bundle.log)
e git diff --check passaram. API/persistência não foram alteradas; integração
backend não foi repetida para esta mudança de apresentação/navegação.

O [primeiro percurso](e2e-initial.log) teve 11 aprovados e um achado Axe:
o atalho numérico da equipe tinha label descritiva sem o número visível.
Corrigido o nome acessível para incluir quantidade e destino; reteste final
aprovado. A falha original foi preservada no log, sem segredos.

## Prints

| Estado                   | Desktop                                 | Mobile                                               |
| ------------------------ | --------------------------------------- | ---------------------------------------------------- |
| Lista unificada compacta | [Print](schools-desktop.png)            | [Print](schools-mobile.png)                          |
| Convites compactos       | [Print](invitations-desktop.png)        | [Print](invitations-mobile.png)                      |
| Baseline anterior        | [Escolas](baseline-schools-desktop.png) | [Convites desktop](baseline-invitations-desktop.png) |

Os seis prints foram abertos pelo agente principal. Revisão visual independente
aprovou as quatro capturas finais: nomes, textos auxiliares, tags, menus,
alinhamento e paginação preservados. No celular, colunas adicionais continuam
acessíveis por rolagem horizontal da região, exercitada pela jornada existente.

## Limites

Dados sintéticos example.test; PostgreSQL/Mailpit efêmeros pelo harness real,
Playwright complementar em 127.0.0.1:43220. Sem QR, token, cookie, senha ou trace
publicado. Sem teste de leitor de tela, zoom ou dispositivo físico.
Browser/Chrome conectado e GIF permanecem BLOQUEADOS/PENDENTES; o gate da
extensão não é declarado aprovado e a issue permanece aberta.
