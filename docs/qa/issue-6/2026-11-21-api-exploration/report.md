# QA-006 — exploração da API

**Resultado: 12 cenários exploratórios aprovados após uma correção de contrato.
Gate completo da etapa: BLOQUEADO para UI e GIFs.** A extensão Chrome e o Browser
não disponibilizaram ferramenta de controle nesta sessão. A indicação de
`@Browser` pelo usuário foi considerada, mas não estabeleceu uma conexão
verificável. Nenhum print novo ou GIF foi produzido neste ciclo.

## Escopo e origem

- Issue: https://github.com/LuisCarlos-git/soe-saas/issues/6.
- Plano anterior à ampliação dos testes:
  https://github.com/LuisCarlos-git/soe-saas/issues/6#issuecomment-7067322295.
- Protocolo: `qa-browser-evidence`.
- Fontes: PRD 1.3 RF01/RF09 e 7.9, decisões 53/54, critérios da issue,
  ADR 0003 e contratos de convite da árvore de trabalho.
- Data: 21/11/2026; logs de execução preservam o horário local observado
  (`America/Sao_Paulo`).
- Branch: `feat/staff-invitations`.
- SHA base: `0416b5bf141d4334b92e1bcda990b78aea0481f2`.
- **WIP:** implementação de convites, pacote de e-mail, migrations, testes
  e correção de OpenAPI ainda não commitados no produto. O commit desta
  evidência não contém nem representa a implementação completa testada.
  [Manifesto](manifest.json) identifica fontes e bundle por SHA-256.
- Origem dos testes: Supertest pela fronteira HTTP de uma API Nest real,
  PostgreSQL 17.9 e Mailpit 1.34.0 temporários via Testcontainers, migrations
  reais, identidades `example.test`, sem envio externo ou dados escolares reais.
- Sem testes visuais ou julgamento de UI novos nesta execução. A rota web
  de aceite de convite ainda não está implementada na árvore atual.

## Baseline

Antes de ampliar a cobertura, passaram os 6 testes do renderer de e-mail e
a jornada HTTP existente de envio/cadastro/aceite/reuso:
[unitário](baseline-unit.log), [integração](baseline-integration.log).
Isso estabelece o início desta exploração; não é um baseline anterior às
mudanças de produto já presentes na árvore de trabalho.

## Matriz executada

| ID            | Preparação e ação                                                                                                              | Esperado e observado                                                                                                                                  | Status              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| QA-006-03-C   | Duas requisições simultâneas de aceite do mesmo convite                                                                        | Status 204 e 410; PostgreSQL confirma exatamente 1 vínculo, 1 auditoria e consumo único                                                               | APROVADO            |
| QA-006-03-E   | Preparar convite expirado no banco descartável e tentar preview/aceite                                                         | Ambos 410; erro seguro INVITATION_INVALID; 0 vínculos, 0 auditorias de aceite e convite não consumido                                                 | APROVADO            |
| QA-006-03-I   | Conta autenticada diferente tenta aceitar; destinatário tenta em seguida                                                       | Conta diferente recebe 403 sem efeito; destinatário conclui com 204 e efeito único                                                                    | APROVADO            |
| QA-006-03-MFA | Destinatário tenta aceitar SCHOOL_ADMIN antes/depois de verificar MFA                                                          | Antes: 403/MFA_REQUIRED e 0 efeitos; depois: 204, vínculo/auditoria únicos e acesso administrativo na escola                                          | APROVADO            |
| QA-006-03-R   | Repetir cadastro com outro nome/senha usando convite ainda pendente                                                            | 409; credencial original continua válida, nome permanece e aceite original funciona                                                                   | APROVADO            |
| QA-006-04-M   | Uma pessoa aceita TEACHER na escola A e DIRECTION na B                                                                         | Listagem contém papéis independentes; com MFA verificada, ambas as escolas recusam gestão de convites com 404; nenhum convite administrativo indevido | APROVADO            |
| QA-006-04-A   | Admin A tenta listar/criar convites na escola B                                                                                | Ambos 404 e 0 registros para o destinatário de teste                                                                                                  | APROVADO            |
| QA-006-06-D   | Duas requisições simultâneas de envio para o mesmo destinatário/escola                                                         | Status 201 e 409; exatamente 1 convite e 1 auditoria de criação                                                                                       | APROVADO            |
| QA-006-06-V   | Nome vazio, papéis vazios/duplicados/desconhecidos, userId/organizationId forjados; origem externa/ausente e acesso sem sessão | Validação 400, origem 403 e sessão 401; schema seguro, no-store e nenhum convite persistido                                                           | APROVADO            |
| QA-006-07-T   | Trigger temporária recusa auditoria de aceite; remover falha e repetir                                                         | Primeiro 500 seguro, sem consumo/vínculo/auditoria; depois 204 com efeito único                                                                       | APROVADO            |
| QA-006-08-O   | Comparar respostas de erro do fluxo com OpenAPI gerado                                                                         | Falhou inicialmente porque só havia sucesso; após correção, erros esperados constam do contrato                                                       | APROVADO no reteste |
| QA-006-09-L   | Limite de 1 tentativa em API de teste; forjar X-Forwarded-For e reiniciar API                                                  | Primeiro 410 para token inexistente; seguintes 429 antes e depois de reiniciar, sem bypass pelo header                                                | APROVADO            |

O schema das respostas de convite, vínculos e erros foi validado nos pontos
indicados pelos testes. Sentinelas de token não aparecem nos logs capturados
dos cenários de concorrência e rollback. Asserções de saneamento são limitadas
aos cenários executados, não uma certificação de ausência de vazamentos em
qualquer falha possível.

Expiração foi preparada por atualização temporal no PostgreSQL **de teste**:
não houve espera em relógio real. A falha de auditoria também foi injetada
somente nesse banco e removida em `finally`. Nenhuma falha foi induzida no
banco de desenvolvimento ou em produção.

## Defeito encontrado e reteste

**QA-006-B01 — gravidade moderada: erros da API ausentes no OpenAPI.**

Reprodução: gerar o contrato da API atual e comparar
`POST /api/v1/schools/{organizationId}/invitations` com os casos HTTP inválidos,
sem sessão, sem autorização e de convite duplicado. Esperado: os status de
erro e o schema seguro estão documentados. Observado antes: somente 201 no
contrato. As rotas públicas também documentavam somente sucesso.

- [Falha original](openapi-before-failure.log): 1 teste falhou, 8 passaram.
- Correção local: decorators de erro usando `SafeErrorResponse` nos controllers
  de convites; autenticação por cookie documentada no aceite e nos vínculos.
  A alteração não muda a regra de negócio ou a resposta HTTP executada.
- [Reteste](exploration-after-fix.log): 12 testes passaram.
- [Contrato observado após rebuild](openapi-after.json): extraído do OpenAPI
  gerado, com rotas e status, sem bodies ou segredos de autenticação.
- [Regressão completa de integração](integration-regression.log): 29 testes,
  6 suítes, todos aprovados.

## Checks

| Check                                                   | Resultado observado                       |
| ------------------------------------------------------- | ----------------------------------------- |
| `pnpm --filter @soe/api build`                          | Exit 0; bundle e OpenAPI gerados          |
| `pnpm --filter @soe/api typecheck`                      | Exit 0                                    |
| ESLint dos arquivos staff e teste exploratório          | Exit 0                                    |
| `pnpm architecture:check`                               | Exit 0; fixtures negativas rejeitadas     |
| `pnpm test:unit`                                        | Exit 0; 33 testes em 6 arquivos aprovados |
| `pnpm test:integration`                                 | Exit 0; 29 testes em 6 suítes aprovados   |
| Prettier dos controllers alterados e teste exploratório | Exit 0 após formatação                    |
| `git diff --check`                                      | Exit 0                                    |

## Cobertura pendente e decisão

- **UI/GIF bloqueados:** ferramentas conectadas de Chrome/Browser ausentes.
  Conforme a skill: “Se a extensão, mídia requerida, ambiente ou upload estiver
  indisponível, o gate continua PENDENTE/BLOQUEADO.”
- Jornada web de convite/aceite, modal, teclado/foco, desktop/mobile, voltar,
  reload, sessão expirada, duas abas e falha de rede na UI não executados.
- Comportamento de retry/reinício da fila SMTP e falha prolongada de entrega
  não cobertos por esta exploração; enviar no Mailpit não prova leitura humana.
- Revogação/reemissão e retirada de autoridade do emissor não exercitadas.
- Conteúdo restrito não foi validado por endpoint real neste ciclo. TEACHER e
  DIRECTION não conseguirem administrar convites não prova toda a política
  futura de concessões restritas.
- Nenhum E2E visual novo executado e nenhum GIF substituído por montagem.
- A issue continua aberta e seus critérios não foram marcados com base nesta
  evidência parcial. Próximo passo: disponibilizar controle do Browser,
  concluir a superfície de convite/aceite e executar a exploração visual.
