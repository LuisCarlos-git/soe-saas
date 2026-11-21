# QA-006 — frontend de convites

**Frontend implementado e verificado por automação complementar. Gate de QA
pela extensão/Browser: PENDENTE**, pois nenhuma ferramenta de controle ficou
disponível nesta sessão. Não foi produzido GIF nem houve fechamento da issue.

## Origem

- Issue: https://github.com/LuisCarlos-git/soe-saas/issues/6.
- Plano antes da implementação:
  https://github.com/LuisCarlos-git/soe-saas/issues/6#issuecomment-7067587212.
- Achados de revisão:
  https://github.com/LuisCarlos-git/soe-saas/issues/6#issuecomment-7068056078.
- Fontes: PRD RF01/RF09, seções 6/7/16, decisões 53/54, ADR 0003, DESIGN.md,
  contratos e critérios da #6; cinco skills de design e screen-design-review.
- Fontes testadas registradas nos commits `72b1f3b` e
  `97d51305c68d9b68d3d2aa15e4e09349ae33400b`, branch `feat/staff-invitations`.
  Testes começaram em WIP; a evidência é publicada em commit separado.
- Ambiente de automação: Chromium/Playwright em http://127.0.0.1:43220,
  API real, PostgreSQL 17.9 e Mailpit 1.34.0 descartáveis, migrations reais,
  identidades sintéticas `example.test` e nenhum envio externo.
- Viewports: desktop 1280×720 e mobile 360×780. PNGs são fullPage e podem ter
  altura maior. Mobile executa reduced-motion; não é um dispositivo físico.
- Antes da edição: baseline de 33 testes unitários e 29 de integração aprovado.
  A etapa adicionou a regressão de substituição de convite expirado.

## Implementação observada

Escola → Profissionais aparece somente para quem administra alguma escola.
A escolha de escola é explícita. A modal valida nome, e-mail e papéis, permite
revisar/voltar e cria o convite. A lista diferencia envio de e-mail e aceite.
O link real do Mailpit abre cadastro/login, troca de conta, MFA para papel
administrativo e confirmação de aceite. O token fica no fragmento/memória,
fora de query keys, storage e conteúdo renderizado; é removido da URL após
o aceite. Traces das jornadas de convite foram desabilitados para não publicar
capabilities, credenciais e material de inscrição MFA em artifacts de CI.

## Cenários e resultados

| ID       | Percurso e asserções                                                                                                                                   | Resultado                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| UI01     | Conta sem escola administrada não vê o menu; URLs diretas retornam tela segura; hash inválido tem recuperação                                          | APROVADO em desktop/mobile                           |
| UI02     | Duas escolas do mesmo admin; selecionar outra mostra lista vazia sem convite da primeira                                                               | APROVADO em desktop/mobile                           |
| UI03     | Formulário vazio exibe validação; nome/e-mail/papel preenchidos; revisão recebe foco; voltar preserva dados; um envio HTTP                             | APROVADO em desktop/mobile                           |
| UI04     | Mailpit recebe e-mail real; lista passa de Pendente de aceite/E-mail enviado para Aceito após o percurso                                               | APROVADO em desktop/mobile                           |
| UI05     | Conta errada troca de conta; destinatário novo cadastra/entra; identidade existente entra por senha e recebe papel independente em outra escola        | APROVADO em desktop/mobile                           |
| UI05-MFA | Novo admin não vê ação de aceitar antes do MFA; inscrição/verificação oficial pelo fluxo da UI libera aceite e menu administrativo                     | APROVADO em desktop/mobile                           |
| UI06     | Reabrir link já consumido na mesma aba mostra indisponível; aceite limpa fragmento; API confirma vínculo somente na escola correta                     | APROVADO em desktop/mobile                           |
| UI07     | Tab entre campos, seleção de papel por Espaço, Escape com descarte recusado, foco entre passos e de volta ao trigger; saída nativa da modal no desktop | APROVADO em desktop/mobile; reduced-motion no mobile |
| UI08     | Casos HTTP de autorização/isolamento, concorrência e rollback complementam a UI                                                                        | APROVADO nos limites da suíte HTTP                   |

Axe retornou zero violações nas superfícies exercitadas: convite inválido,
modal preenchida e confirmação de aceite. Isso não certifica WCAG de todo o
produto nem substitui teste com leitor de tela. Os asserts de foco e teclado
são comportamentais; os prints não são usados como prova de movimento.

## Achados e retestes

| Achado                                                                              | Antes                                                        | Correção e reteste                                                                                                                                                         |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI-B01: reutilizar link na mesma aba mantinha sucesso anterior                      | [Falha original](ui-before-fix.log)                          | Mudanças de fragmento recarregam o convite e cancelam leitura anterior; [jornada final](ui-final.log) passa                                                                |
| API-B02: expirado reservava e-mail e impedia novo convite                           | [HTTP 409 no teste que esperava 201](expired-before-fix.log) | Substituição transacional preserva histórico/auditoria, limpa segredo e invalida revisão; link antigo 410 e novo válido; [integração final](integration-final.log) passa   |
| Standards: propriedade da identidade, regras fora de use-cases e queryOptions na UI | 3 achados P2 da revisão estática                             | Identity possui criação/credencial/audit; Staff usa capacidade pública transacional; autorização fica nos casos de uso; queries em staff/data. Revisor confirmou resolução |

Na primeira execução, uma preparação mobile tentou sair antes de abrir o menu;
o teste foi corrigido. Uma execução da prévia UI falhou durante hot reload
simultâneo a builds; execução serial passou sem alterar a receita visual.
Os logs também registram avisos de cor do runner e `AbortError` de requisições
canceladas no proxy srvx. Não houve falha funcional associada nos asserts; não
se declara console/servidor sem avisos.

## Checks realmente executados

| Check                                                                       | Resultado                                                                                                                        |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Build da API e web                                                          | Exit 0                                                                                                                           |
| Typecheck, lint e arquitetura                                               | Exit 0                                                                                                                           |
| Testes unitários                                                            | 33 aprovados                                                                                                                     |
| HTTP/PostgreSQL final                                                       | 30 aprovados em 6 suítes                                                                                                         |
| Suíte completa de navegador, antes dos ajustes finais de fronteira/presença | 6 de UI, 14 de form e 26 jornadas web aprovados                                                                                  |
| Reteste final da jornada de convite após os ajustes, teclado e foco         | 4 casos aprovados, 2 em cada viewport                                                                                            |
| Prettier, fronteiras de bundle e diff                                       | Aprovados; SQL canônico pg-boss preservado com exceção de whitespace restrita à migração gerada para manter checksum já aplicado |

Logs e hashes estão no [manifesto](manifest.json). Nenhuma execução remota de CI
é presumida. O teste completo de navegador e o reteste final têm escopos
diferentes e estão documentados separadamente, sem somar como novos cenários.

## Revisões independentes

**Standards:** 3 achados, todos resolvidos; zero material aberto na releitura.
**Spec:** 1 achado P1 de recuperação de expirado, resolvido e retestado.
**Visual:** 25 PNGs inspecionados individualmente, sem achado material; aprovação
mantida após a correção de presença da modal. Revisão estática não mede todas
as razões de contraste e não substitui interação/leitor de tela ou Browser.

## Evidência e limites

As 25 capturas revisadas estão na [galeria](screenshots.md). Não contêm senha,
QR/chave MFA nem token visível. Estados de QR e traces brutos não foram
publicados. Dados de nomes/e-mails são sintéticos.

Reenvio geral/revogação e edição de vínculos existentes não foram adicionados
a esta superfície. Responsável inicial da escola ainda é uma identidade
existente; bootstrap por convite não foi alterado. Retry prolongado/falha de
SMTP e endpoints reais de conteúdo restrito não foram validados neste ciclo.
Não se afirma exploração exaustiva de sessão expirada, rede instável ou duas
abas pela UI; concorrência é exercitada pela suíte HTTP.

Para teste manual, consulte o [runbook](../../../runbooks/invitations.md).
O ambiente local em 127.0.0.1:43120 teve migrations aplicadas, Mailpit habilitado
e HTTP 200 confirmado para API pronta, tela de aceite e caixa de e-mail.
O gate pela extensão/Browser e GIFs continua pendente conforme a skill
qa-browser-evidence; nenhum critério da issue foi marcado com essa cobertura.
